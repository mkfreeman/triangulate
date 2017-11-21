// Resampler
import * as d3 from 'd3';

// Define resampler class
class Resampler {
    constructor(width, height, num_points) {
        this.width = width || 100;
        this.height = height || 100;
        this.num_points = num_points || 100;
    }
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

    getSites() {
        this.sites = d3
            .range(this.num_points)
            .map((d) => [
                Math.random() * this.width,
                Math.random() * this.height
            ]);
        return this;
    };
};
export default Resampler;