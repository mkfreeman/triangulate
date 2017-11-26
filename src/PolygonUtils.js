// Utilities for computing Polygon layouts
import * as d3 from 'd3';

const PolygonUtils = {
    // Get area
    area(polygon) {
        var area = 0;
        var n = polygon.length;
        var j = n - 1;
        for (var i = 0; i < n; j = i++) {
            area += polygon[i][0] * polygon[j][1];
            area -= polygon[i][1] * polygon[j][0];
        }
        area /= 2;
        return area;
    },

    // Get 
    getImageOffset(pt, width, height) {
        var x = Math.round(pt[0]);
        var y = Math.round(pt[1]);
        if (x < 0)
            x = 0;
        if (y < 0)
            y = 0;
        if (x >= width)
            x = width - 1;
        if (y >= height)
            y = height - 1;
        return (4 * (x + y * width));
    },

    // Compute centroid
    centroid(polygon) {
        var n = polygon.length;
        var x = 0;
        var y = 0;
        var j = n - 1;
        for (var i = 0; i < n; j = i++) {
            var tmp = polygon[i][0] * polygon[j][1] - polygon[j][0] * polygon[i][1];
            x += (polygon[i][0] + polygon[j][0]) * tmp;
            y += (polygon[i][1] + polygon[j][1]) * tmp;
        }
        var sixA = this.area(polygon) * 6;
        return [
            x / sixA,
            y / sixA
        ];
    },

    // Compute centroids of multiple elements
    getCentroids(polygons) {
        return polygons.map((d) => this.centroid(d));
    },

    // Smooth sites using Laplacian approch
    getLaplacianSites: function(sites, diagram) {
        let tmpSites = d3
            .range(sites.length)
            .map(function(d) {
                return [0.0, 0.0];
            });
        var totalWeights = sites.map(function(s) {
            return 0.0;
        });

        diagram
            .edges
            .forEach(function(edge) {
                if (typeof edge.right !== 'undefined') {
                    var l = edge.left.index;
                    var r = edge.right.index;
                    tmpSites[l][0] += edge.right.data[0];
                    tmpSites[l][1] += edge.right.data[1];
                    totalWeights[l] += 1.0;
                    tmpSites[r][0] += edge.left.data[0];
                    tmpSites[r][1] += edge.left.data[1];
                    totalWeights[r] += 1.0;
                } else {
                    var l = edge.left.index;
                    tmpSites[l][0] += (edge[0][0] + edge[1][0]);
                    tmpSites[l][1] += (edge[0][1] + edge[1][1]);
                    totalWeights[l] += 2.0;
                }
            });

        for (var i = 0, n = tmpSites.length; i < n; ++i) {
            tmpSites[i][0] /= totalWeights[i];
            tmpSites[i][1] /= totalWeights[i];
        }

        return tmpSites;
    },

    // Smooth sites using Polygon Vertex Average
    polygonVertexAverage: function(polygon) {
        var n = polygon.length;
        var x = 0;
        var y = 0;
        for (var i = 0; i < n; ++i) {
            x += polygon[i][0];
            y += polygon[i][1];
        }
        return [
            x / n,
            y / n
        ];
    },
    getPolygonVertexAverages: function(polygons) {
        return polygons.map((d) => this.polygonVertexAverage(d));
    }
}

export default PolygonUtils;