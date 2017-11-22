// Resampler
import * as d3 from 'd3';

// Define resampler class
class Resampler {
    constructor(width, height, numPoints) {
        this.width = width || 100;
        this.height = height || 100;
        this.numPoints = numPoints || 100;
    // this.setVoronoi().getSites()
    }
    updateValue(prop, value) {
        if (value == this[prop]) return this;
        this[prop] = value;
        this.setVoronoi().getSites()
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

    getSites() {
        this.sites = d3
            .range(this.numPoints)
            .map((d) => [
                Math.random() * this.width,
                Math.random() * this.height
            ]);
        return this;
    };
}
;
export default Resampler;