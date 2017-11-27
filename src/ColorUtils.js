// Utilities for computing colors

// Import polygon functions
import PolygonUtils from './PolygonUtils';

const ColorUtils = function() {
    let width = 1000,
        height = 1000,
        threshold = 100,
        blackWhite = false,
        invert = false,
        fillColor = 'centroid',
        srcCanvas = null;

    let utils = {};
    utils.setSrcCanvas = function(srcCanvas) {
        // Store canvas data
        console.log('width', width, 'height', height)
        console.log(srcCanvas, width, height)
        let context = srcCanvas.getContext('2d');
        let canvasData = context.getImageData(0, 0, width, height);
        this.imageBuffer8 = new Uint8Array(canvasData.data.buffer);
    }
    utils.makeColorString = function(r, g, b, a) {
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }
    utils.getDotColor = function(pt, r) {
        if (fillColor == 'centroid')
            return this.getColorAtPos(pt);

        var pt1 = [
            pt[0] + r,
            pt[1]
        ];
        var pt2 = [
            pt[0] - r,
            pt[1]
        ];
        var pt3 = [
            pt[0], pt[1] + r
        ];
        var pt4 = [
            pt[0], pt[1] - r
        ];
        var pts = [pt1, pt2, pt3, pt4];

        return this.getAverageColor(pt, pts);
    }
    utils.getColor = function(d) {
        var centroid = PolygonUtils.centroid(d);
        if (fillColor == 'centroid')
            return this.getColorAtPos(centroid);

        return this.getAverageColor(centroid, d);
    }
    utils.getAverageColor = function(c, p) {
        var r = 0;
        var g = 0;
        var b = 0;
        var a = 0;
        var offset = PolygonUtils.getImageOffset(c, width, height);
        r += p.length * this.imageBuffer8[offset];
        g += p.length * this.imageBuffer8[offset + 1];
        b += p.length * this.imageBuffer8[offset + 2];
        a += p.length * this.imageBuffer8[offset + 3];

        p.forEach(function(pt) {
            offset = PolygonUtils.getImageOffset(pt, width, height);
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
        if (blackWhite == 1) {
            var y = 0.2126 * r + 0.7152 * g + 0.0722 * b
            var test = invert == 0 ? y < threshold : y > threshold
            var color = test ? 'black' : 'white'
        }
        return color;
    }
    utils.getColorAtPos = function(pt) {
        // Get color
        var offset = PolygonUtils.getImageOffset(pt, width, height);
        var color = this.makeColorString(this.imageBuffer8[offset], this.imageBuffer8[offset + 1], this.imageBuffer8[offset + 2], this.imageBuffer8[offset + 3]);
        // Calculate luminence
        if (blackWhite == 1) {
            var y = 0.2126 * this.imageBuffer8[offset] + 0.7152 * this.imageBuffer8[offset + 1] + 0.0722 * this.imageBuffer8[offset + 2]
            var test = invert == 0 ? y < threshold : y > threshold;
            var color = test ? 'black' : 'white'
        }
        return color;
    }

    // Getter / setter methods
    utils.height = function(h) {
        if (arguments.length === 0) return height;
        height = h;
        return utils;
    };
    utils.width = function(w) {
        if (arguments.length === 0) return width;
        console.log("set width", w)
        width = w;
        console.log("set width", width)
        return utils;
    };
    utils.blackWhite = function(w) {
        if (arguments.length === 0) return blackWhite;
        blackWhite = w;
        return utils;
    };
    utils.threshold = function(t) {
        if (arguments.length === 0) return threshold;
        threshold = t;
        return utils;
    };
    utils.invert = function(i) {
        if (arguments.length === 0) return invert;
        invert = i;
        return utils;
    };
    utils.srcCanvas = function(s) {
        if (arguments.length === 0) return srcCanvas;
        srcCanvas = s;
        return utils;
    };
    utils.fillColor = function(f) {
        if (arguments.length === 0) return fillColor;
        fillColor = f;
        return utils;
    };
    return utils;

}
export default ColorUtils;