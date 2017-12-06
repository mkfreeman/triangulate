// Resampler
import * as d3 from 'd3';
import PolygonUtils from './PolygonUtils';

// Define resampler class: resamples and smooths points
class Resampler {
    constructor(width, height, numPoints, smoothIters, smoothType, shape, numResample, circleSpacing) {
        this.width = width || 100;
        this.circleSpacing = circleSpacing || 3;
        this.height = height || 100;
        this.numPoints = numPoints || 100;
        this.smoothIters = smoothIters || 0;
        this.numResample = numResample || 0;
        this.smoothType = smoothType || 'lloyd';
        this.shape = shape || "triangles";
        this.imageBuffer8 = {};
        this.needsSitesUpdate = true;;
        this.needsSmootherUpdate = true;
    }
    setSrcCanvas(srcCanvas) {
        if (srcCanvas !== null) {
            let context = srcCanvas.getContext('2d');
            let canvasData = context.getImageData(0, 0, this.width, this.height);
            this.imageBuffer8 = new Uint8Array(canvasData.data.buffer);
        }
    }
    updateValues(obj) {
        Object.keys(obj).forEach(function(prop) {
            if (obj[prop] === this[prop]) return;
            this[prop] = obj[prop];
            this.needsSitesUpdate = true;
            this.needsSmootherUpdate = true;
        }.bind(this))
        return this;
    }
    updateSmoother(obj) {
        Object.keys(obj).forEach(function(prop) {
            if (obj[prop] === this[prop]) return;
            this[prop] = obj[prop];
            this.needsSmootherUpdate = true;
        }.bind(this));
        return this;
    }

    // Set the d3 voronoi diagram using current width/height
    setVoronoi() {
        this.voronoi = d3
            .voronoi()
            .extent([
                [
                    -1, -1
                ],
                [
                    this.width + 1,
                    this.height + 1
                ]
            ]);
        return this;
    }

    // Naively Set the current sites by randomly sampling in the width/height areas
    setSites() {
        if (this.needsSitesUpdate === false) return this;
        this.sites = d3
            .range(this.numPoints)
            .map(function(d) {
                let pt = [
                    Math.random() * this.width,
                    Math.random() * this.height];

                // Resample for contrast!
                let radius = Math.sqrt(this.width * this.height / this.numPoints) / 2;
                if (radius < 1)
                    radius = 1;
                let score = this.approximateGradient(pt, radius);
                for (var i = 0; i < this.numResample; ++i) {
                    var newPt = [
                        Math.random() * this.width,
                        Math.random() * this.height
                    ];
                    var newScore = this.approximateGradient(newPt, radius);
                    if (newScore > score)
                        pt = newPt;
                }
                return pt;

            }.bind(this));
        this.needsSitesUpdate = false;
        return this;
    }
    // Helper function for approximating gradient
    imageDiffSq = function(off1, off2) {
        var r = this.imageBuffer8[off1] - this.imageBuffer8[off2];
        var b = this.imageBuffer8[off1 + 1] - this.imageBuffer8[off2 + 1];
        var g = this.imageBuffer8[off1 + 2] - this.imageBuffer8[off2 + 2];
        return r * r + b * b + g * g;
    }
    // Function for resampling for contrast
    approximateGradient(pt, d) {
        var off = PolygonUtils.getImageOffset(pt);
        var offpx = PolygonUtils.getImageOffset([
            pt[0] + d,
            pt[1]
        ]);
        var offmx = PolygonUtils.getImageOffset([
            pt[0] - d,
            pt[1]
        ]);
        var offpy = PolygonUtils.getImageOffset([
            pt[0], pt[1] + 5
        ]);
        var offmy = PolygonUtils.getImageOffset([
            pt[0], pt[1] - 5
        ]);
        return this.imageDiffSq(offpx, off) + this.imageDiffSq(offmx, off) + this.imageDiffSq(offpy, off) + this.imageDiffSq(offmy, off);
    }
    // Issue: this could be re-written so that you only sample the additionally necessary times 
    // I.e., if you want 30 samples (and have done 29), only re-sample once more!
    // This would require not re-setting the sites in this function....
    smoothSites() {
        // Set sites, so that you start with a clean set of sites (i.e., so that it un-smooths)
        if (this.needsSmootherUpdate === false) return this;
        this.setSites()
        for (var i = 0; i < this.smoothIters; ++i) {
            if (this.smoothType === 'lloyd') {
                let polygons = this.voronoi(this.sites).polygons();
                this.sites = PolygonUtils.getCentroids(polygons);
            }
            if (this.smoothType === 'laplacian') {
                let diagram = this.voronoi(this.sites);
                this.sites = PolygonUtils.getLaplacianSites(this.sites, diagram);
            }
            if (this.smoothType === 'polygonVertex') {
                let polygons = this.voronoi(this.sites).polygons();
                this.sites = PolygonUtils.getPolygonVertexAverages(polygons);
            }
        }
        this.needsSmootherUpdate = false;

        return this;
    }

    // Function to get dot radii given the diagram
    getDotRadii() {
        let diagram = this.voronoi(this.sites);
        // first compute the distance to the nearest and furthest Voronoi neighbors
        var minDist = [];
        var maxDist = [];
        var radii = [];
        this.sites.forEach(function(site) {
            minDist.push(this.width + this.height);
            maxDist.push(0.0);
            radii.push(0.0);
        }.bind(this));

        diagram
            .edges
            .forEach(function(edge) {
                if (typeof edge.right !== 'undefined') {
                    var l = edge.left.index;
                    var r = edge.right.index;
                    var dx = edge.right.data[0] - edge.left.data[0];
                    var dy = edge.right.data[1] - edge.left.data[1];
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    minDist[l] = Math.min(minDist[l], dist);
                    minDist[r] = Math.min(minDist[r], dist);
                    maxDist[l] = Math.max(maxDist[l], dist);
                    maxDist[r] = Math.max(maxDist[r], dist);
                }
            });

        // Dot radii are selected so that they don't overlap (i.e., they must be less
        // than minDist[i]/2.0. Moreover, we use the distance to the furthest neighbor
        // to decide how much space to leave... if the points are roughly uniformly
        // spaced, we only cover roughly 1/3 the distance but the max distance is
        // further, we choose a radius close to half the min distance in attempt to
        // leave less blank whitespace in the image.
        //
        // The constants below (2.05 and 3.05 / 1.0) were selected based on what I
        // thought looked ok on a couple images but maybe this is something that needs
        // to be exposed.
        for (var i = 0, n = radii.length; i < n; ++i) {
            var ratio = maxDist[i] / minDist[i];
            if (ratio > 2.0)
                radii[i] = minDist[i] / 2.05;
            else {
                // radii[i] = minDist[i] / (3.05 - 1.0 * (ratio - 1.0));
                let val = minDist[i] / (this.circleSpacing - 1.0 * (ratio - 1.0)) <= 1 ? 1 : minDist[i] / (this.circleSpacing - 1.0 * (ratio - 1.0));
                radii[i] = val;
            }

        }
        let sitesWithRadii = this.sites.map(function(d, i) {
            d.radius = radii[i];
            return d;
        })
        return sitesWithRadii;
    }
    // Function that returns the shapes for use
    getPolygons() {
        // Set voronoi, sites, and smooth them
        this.setVoronoi()
            .setSites()
            .smoothSites();
        let shapes;
        switch (this.shape) {
            case 'triangles':
                shapes = this.voronoi(this.sites).triangles();
                break;
            case 'polygons':
                shapes = this.voronoi(this.sites).polygons()
                break;
            case 'circles':
                shapes = this.getDotRadii();
                break;
            default:
                break;
        }
        return shapes;
    }
}

export default Resampler;