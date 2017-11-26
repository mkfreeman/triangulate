// Resampler
import * as d3 from 'd3';
import PolygonUtils from './PolygonUtils';

// Define resampler class: resamples and smooths points
class Resampler {
    constructor(width, height, numPoints, smoothIters, smoothType, shape) {
        this.width = width || 100;
        this.height = height || 100;
        this.numPoints = numPoints || 100;
        this.smoothIters = smoothIters || 0;
        this.smoothType = smoothType || 'lloyd';
        this.shape = shape || "triangles";
    }
    updateValues(obj) {
        let update = false;
        Object.keys(obj).forEach(function(prop) {
            if (obj[prop] === this[prop]) return;
            this[prop] = obj[prop];
            update = true;
        }.bind(this))
        if (update === true) {
            console.log('update sites')
            this.setVoronoi().setSites();
        }
        return this;
    }
    updateSmoother(obj) {
        let update = false;
        Object.keys(obj).forEach(function(prop) {
            if (obj[prop] === this[prop]) return;
            this[prop] = obj[prop];
            update = true;
        }.bind(this));
        if (update === true) {
            this.smoothSites();
        }
        return this;
    }

    // Set the d3 voronoi diagram using current width/height
    setVoronoi() {
        console.log('set voronoi', this.height, this.width)
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
        console.log('set sites', this.width, this.height)
        this.sites = d3
            .range(this.numPoints)
            .map((d) => [
                Math.random() * this.width,
                Math.random() * this.height
            ]);
        // this.smoothSites();
        return this;
    }
    // Issue: this could be re-written so that you only sample the additionally necessary times 
    // I.e., if you want 30 samples (and have done 29), only re-sample once more!
    // This would require not re-setting the sites in this function....
    smoothSites() {
        // Set sites, so that you start with a clean set of sites (i.e., so that it un-smooths)
        this.setSites();
        for (var i = 0; i < this.smoothIters; ++i) {
            if (this.smoothType == 'lloyd') {
                let polygons = this.voronoi(this.sites).polygons();
                this.sites = PolygonUtils.getCentroids(polygons);
            }
            if (this.smoothType == 'laplacian') {
                let diagram = this.voronoi(this.sites);
                this.sites = PolygonUtils.getLaplacianSites(this.sites, diagram);
            }
            if (this.smoothType == 'polygonVertex') {
                let polygons = this.voronoi(this.sites).polygons();
                this.sites = PolygonUtils.getPolygonVertexAverages(polygons);
            }
        }

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
                radii[i] = minDist[i] / (3.05 - 1.0 * (ratio - 1.0));
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
        }
        return shapes;
    }
}

export default Resampler;