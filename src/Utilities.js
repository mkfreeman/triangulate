// Utilities

// Import polygon functions
import PolygonUtils from './PolygonUtils';

class Utilities {
    constructor() {}
    setOptions(options) {
        Object.keys(options).forEach((d) => this[d] = options[d]);
    }

    setSrcCanvas(srcCanvas) {
        // Store canvas data
        let context = srcCanvas.getContext('2d');
        let canvasData = context.getImageData(0, 0, this.width, this.height);
        this.imageBuffer8 = new Uint8Array(canvasData.data.buffer);
    }
    makeColorString(r, g, b, a) {
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }
    getColor(d) {
        var centroid = PolygonUtils.centroid(d);
        if (this.fillColor == 'centroid')
            return this.getColorAtPos(centroid);

        return this.getAverageColor(centroid, d);
    }
    getAverageColor(c, p) {
        var r = 0;
        var g = 0;
        var b = 0;
        var a = 0;
        var offset = PolygonUtils.getImageOffset(c, this.width, this.height);
        r += p.length * this.imageBuffer8[offset];
        g += p.length * this.imageBuffer8[offset + 1];
        b += p.length * this.imageBuffer8[offset + 2];
        a += p.length * this.imageBuffer8[offset + 3];

        p.forEach(function(pt) {
            offset = PolygonUtils.getImageOffset(pt, this.width, this.height);
            r += this.imageBuffer8[offset];
            g += this.imageBuffer8[offset + 1];
            b += this.imageBuffer8[offset + 2];
            a += this.imageBuffer8[offset + 3];
        }.bind(this));

        r /= (2 * p.length);
        g /= (2 * p.length);
        b /= (2 * p.length);
        a /= (2 * p.length);
        var color = this.makeColorString(Math.round(r), Math.round(g), Math.round(b), Math.round(a));
        if (this.blackWhite == 1) {
            var y = 0.2126 * r + 0.7152 * g + 0.0722 * b
            var test = this.invert == 0 ? y < this.threshold : y > this.threshold
            var color = test ? 'black' : 'white'
        }
        return color;
    }
    getColorAtPos(pt) {
        // Get color
        var offset = PolygonUtils.getImageOffset(pt, this.width, this.height);
        var color = this.makeColorString(this.imageBuffer8[offset], this.imageBuffer8[offset + 1], this.imageBuffer8[offset + 2], this.imageBuffer8[offset + 3]);
        // Calculate luminence
        if (this.blackWhite == 1) {
            var y = 0.2126 * this.imageBuffer8[offset] + 0.7152 * this.imageBuffer8[offset + 1] + 0.0722 * this.imageBuffer8[offset + 2]
            var test = this.invert == 0 ? y < this.threshold : y > this.threshold;
            var color = test ? 'black' : 'white'
        }
        return color;
    }

}
export default Utilities;