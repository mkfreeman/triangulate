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
        this.needsSitesUpdate = true;
        this.needsWeightUpdate = true;
        this.needsSmootherUpdate = true;

    }
    setSrcCanvas(srcCanvas) {
        if (srcCanvas !== null) {
            let context = srcCanvas.getContext('2d');
            let canvasData = context.getImageData(0, 0, this.width, this.height);
            this.imageBuffer8 = new Uint8Array(canvasData.data.buffer);
            this.needsWeightUpdate = true;
        }
        return this;
    }
    updateValues(obj) {
        Object.keys(obj).forEach(function(prop) {
            if (obj[prop] === this[prop]) return;
            this[prop] = obj[prop];
            this.needsSitesUpdate = true;
            this.needsWeightUpdate = true;
            this.needsSmootherUpdate = true;
        }.bind(this))
        return this;
    }
    updateWeight(obj) {
        Object.keys(obj).forEach(function(prop) {
            if (obj[prop] === this[prop]) return;
            this[prop] = obj[prop];
            this.needsWeightUpdate = true;
            this.needsSmootherUpdate = true;
        }.bind(this));
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
                let x = Math.random() * this.width;
                let y = Math.random() * this.height;
            
                if (this.numResample > 0) {
                    let randVal = Math.random() * 100;
                    if (randVal < this.numResample) {
                        let curResample = 6; //Math.min(10,Math.ceil(randVal / 3));
                        let radius = Math.max(1, Math.sqrt(this.width * this.height / this.numPoints) / 2);
                        let score = this.approximateGradient(x, y, radius);
                        for (let i = 0; i < curResample; ++i) {
                            let newX = Math.random() * this.width;
                            let newY = Math.random() * this.height;
                            let newScore = this.approximateGradient(newX, newY, radius);
                            if (newScore > score) {
                                x = newX;
                                y = newY;
                                score = newScore;
                            }
                        }
                    }
                }
                return [x, y];
            }.bind(this));
        this.needsSitesUpdate = false;
        return this;
    }
    
    // precompute the smoothing weights since this can be expensive and
    // only needs to be done when the image changes, not other settings
    setWeight() {
        if (this.needsWeightUpdate === false) return this;
        this.weights = []; 
        if (this.smoothType === 'contrastWeighted') {
            for (let iW =0; iW < this.width; ++iW) {
                if (iW % 2  === 0) {
                    for (let iH=0; iH < this.height; ++iH) {
                        this.weights.push(this.approximateGradient(iW, iH, 1) + 1.0);
                    }
                } else {
                    for (let iH=this.height-1; iH >= 0; --iH) {
                        this.weights.push(this.approximateGradient(iW, iH, 1) + 1.0);
                    }
                }
            }
            // only need to redo the smoothing if we are using weighted smoothing
            this.needsSmootherUpdate = true;
        }

        this.needsWeightUpdate = false;
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
    approximateGradient(x, y, d) {
        let off = PolygonUtils.getImageOffset(x, y, this.width, this.height);
        return this.imageDiffSq(PolygonUtils.getImageOffset(x + d, y, this.width, this.height), off) +
            this.imageDiffSq(PolygonUtils.getImageOffset(x - d, y, this.width, this.height), off) +
            this.imageDiffSq(PolygonUtils.getImageOffset(x, y + d, this.width, this.height), off) +
            this.imageDiffSq(PolygonUtils.getImageOffset(x, y - d, this.width, this.height), off);
    }

    // Snap the sites with Voronoi cells that touch the  perimeter to actually lie on
    // the perimeter. This is used to create a Delaunay triangulation that covers the 
    // entire square.
    snapToRetainPerimeter() {
        let snappedAny = true;
        let snapCount = 0;
        // Sometimes this takes a couple iterations to ensure that the Delaunay triangulation
        // contains the full perimeter of the shape, although I have never seem more than 3 iterations
        // on normal point distributions.
        while (snappedAny && snapCount < 5)
        {
            let diagram = this.voronoi(this.smoothedSites);
            snappedAny = PolygonUtils.snapToPerimeter(this.smoothedSites, diagram, this.width, this.height);
            snapCount += 1;
        }
        return this;
    }
    
    // Issue: this could be re-written so that you only sample the additionally necessary times 
    // I.e., if you want 30 samples (and have done 29), only re-sample once more!
    // This would require not re-setting the sites in this function....
    smoothSites() {
        // Set sites, so that you start with a clean set of sites (i.e., so that it un-smooths)
        if (this.needsSmootherUpdate === false) return this;
        this.setSites();
        this.setWeight();
        this.smoothedSites = this.sites;
        for (var i = 0; i < this.smoothIters; ++i) {
            
            // Snap to the perimeter during the last few iterations
            // so that the perimeter cells don't end up skewed.
            if (i > this.smoothIters - 3 && 
                this.shape === 'triangles')
                this.snapToRetainPerimeter();
            
            if (this.smoothType === 'lloyd') {
                let polygons = this.voronoi(this.smoothedSites).polygons();
                this.smoothedSites = PolygonUtils.getCentroids(polygons);
            }
            if (this.smoothType === 'laplacian') {
                let diagram = this.voronoi(this.smoothedSites);
                this.smoothedSites = PolygonUtils.getLaplacianSites(this.smoothedSites, diagram);
            }
            if (this.smoothType === 'polygonVertex') {
                let polygons = this.voronoi(this.smoothedSites).polygons();
                this.smoothedSites = PolygonUtils.getPolygonVertexAverages(polygons);
            }
            if (this.smoothType === 'contrastWeighted') {
                let diagram = this.voronoi(this.smoothedSites);
                this.smoothedSites = PolygonUtils.getWeightedSites(this.smoothedSites, this.weights, diagram, this.width, this.height);
            }            
        }
        
        if (this.shape === 'triangles')
            this.snapToRetainPerimeter();
        
        this.needsSmootherUpdate = false;
        
        return this;
    }

    // Function to get dot radii given the diagram
    getDotRadii() {
        let diagram = this.voronoi(this.smoothedSites);
        // first compute the distance to the nearest and furthest Voronoi neighbors
        var minDist = [];
        var maxDist = [];
        var radii = [];
        this.smoothedSites.forEach(function(site) {
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
        let sitesWithRadii = this.smoothedSites.map(function(d, i) {
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
            .setWeight()
            .smoothSites();
        let shapes;
        switch (this.shape) {
            case 'triangles':
                shapes = this.voronoi(this.smoothedSites).triangles();
                break;
            case 'polygons':
                shapes = this.voronoi(this.smoothedSites).polygons()
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