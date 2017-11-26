// Resampler
import * as d3 from 'd3';
import PolygonUtils from './PolygonUtils';

// Define resampler class: resamples and smooths points
class Resampler {
    constructor(width, height, numPoints, smoothIters, smoothType,) {
        this.width = width || 100;
        this.height = height || 100;
        this.numPoints = numPoints || 100;
        this.smoothIters = smoothIters || 0;
        this.smoothType = smoothType || 'lloyd';
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
    setVoronoi() {
        console.log('set voronoi', this.height)
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

    setSites() {
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
        //  else if (SMOOTH_TYPE == 1) {
        //     var diagram = voronoi(newSites);
        //     newSites = getLaplacianSmoothedSites(newSites, diagram);
        // } else if (SMOOTH_TYPE == 2) {
        //     var polygons = voronoi(newSites).polygons();
        //     newSites = getPolygonVertexAverages(polygons);
        // }
        }

        return this;
    }
    getPolygons() {
        return this.voronoi(this.sites).polygons()
    }
}
;
export default Resampler;