// Utilities

class Utilities {
    constructor() {
        // this.width = width || 1000;
        // this.height = height || 1000;
        // this.colorType = colorType || 'average';
        // this.showLines = showLines;
        // this.blackWhite = blackWhite || false;
        // this.invert = invert || false;
        // this.threshold = threshold || 178;
    }
    setOptions(options) {
        Object.keys(options).map((d) => this[d] = options[d]);
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
    polygonArea(polygon) {
        var area = 0;
        var n = polygon.length;
        var j = n - 1;
        for (var i = 0; i < n; j = i++) {
            area += polygon[i][0] * polygon[j][1];
            area -= polygon[i][1] * polygon[j][0];
        }
        area /= 2;
        return area;
    }
    polygonCentroid(polygon) {
        var n = polygon.length;
        var x = 0;
        var y = 0;
        var j = n - 1;
        for (var i = 0; i < n; j = i++) {
            var tmp = polygon[i][0] * polygon[j][1] - polygon[j][0] * polygon[i][1];
            x += (polygon[i][0] + polygon[j][0]) * tmp;
            y += (polygon[i][1] + polygon[j][1]) * tmp;
        }
        var sixA = this.polygonArea(polygon) * 6;
        return [
            x / sixA,
            y / sixA
        ];
    }
    getPolygonCentroids(polygons) {
        return polygons.map(function(p) {
            return this.polygonCentroid(p);
        });
    }
    getColor(d) {
        var centroid = this.polygonCentroid(d);
        if (this.colorType == 0)
            return this.getColorAtPos(centroid);

        return this.getAverageColor(centroid, d);
    }
    getAverageColor(c, p) {
        var r = 0;
        var g = 0;
        var b = 0;
        var a = 0;
        var offset = this.getImageOffset(c);
        r += p.length * this.imageBuffer8[offset];
        g += p.length * this.imageBuffer8[offset + 1];
        b += p.length * this.imageBuffer8[offset + 2];
        a += p.length * this.imageBuffer8[offset + 3];

        p.forEach(function(pt) {
            offset = this.getImageOffset(pt);
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
        var offset = this.getImageOffset(pt);
        var color = this.makeColorString(this.imageBuffer8[offset], this.imageBuffer8[offset + 1], this.imageBuffer8[offset + 2], this.imageBuffer8[offset + 3]);
        // Calculate luminence
        if (this.blackWhite == 1) {
            var y = 0.2126 * this.imageBuffer8[offset] + 0.7152 * this.imageBuffer8[offset + 1] + 0.0722 * this.imageBuffer8[offset + 2]
            var test = this.invert == 0 ? y < this.threshold : y > this.threshold;
            var color = test ? 'black' : 'white'
        }
        return color;
    }
    getImageOffset = function(pt) {
        var x = Math.round(pt[0]);
        var y = Math.round(pt[1]);
        if (x < 0)
            x = 0;
        if (y < 0)
            y = 0;
        if (x >= this.width)
            x = this.width - 1;
        if (y >= this.height)
            y = this.height - 1;
        return (4 * (x + y * this.width));
    }

}
export default Utilities;