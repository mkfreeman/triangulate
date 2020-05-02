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
    getImageOffset(xin, yin, width, height) {
        var x = Math.round(xin);
        var y = Math.round(yin);
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
                    let l = edge.left.index;
                    let r = edge.right.index;
                    tmpSites[l][0] += edge.right.data[0];
                    tmpSites[l][1] += edge.right.data[1];
                    totalWeights[l] += 1.0;
                    tmpSites[r][0] += edge.left.data[0];
                    tmpSites[r][1] += edge.left.data[1];
                    totalWeights[r] += 1.0;
                } else {
                    let l = edge.left.index;
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
    },
    getWeightedSites: function(inputSites, weights, diagram, width, height) {
        // initialize the result to contain the original sites so that
        // if a polygon contains no weight, then the site doesn't move
        let weightedCentroidData = inputSites.map(function(d) {
                return [d[0], d[1] , 0.0];
            });

        // Perform the weighted centroid calculation by integrating over 
        // the entire image and accumulating the integral for the relevant
        // polygon.
        let site = 0;
        let weight = 0;
        let counter = 0;
        for (let iW =0; iW < width; ++iW) {
            for (let iH=0; iH < height; ++iH) {
                weight = weights[counter];
                ++counter; // note: counter = iW*height+iH; but this is a little faster?
                if (weight > 0.0) {
                    site = diagram.find(iW, iH).index; // find which polygon contains this pixels
                    if (weightedCentroidData[site][2] === 0.0) {
                        weightedCentroidData[site][0] = weight*iW;
                        weightedCentroidData[site][1] = weight*iH;
                    } else {
                        weightedCentroidData[site][0] += weight*iW;
                        weightedCentroidData[site][1] += weight*iH;
                    }
                    weightedCentroidData[site][2] += weight;
                }            
            }
        }

        // compute the weighted centroids and return
        return weightedCentroidData.map(function(d) {
                if (d[2] === 0.0)
                    return [d[0], d[1]];
                return [d[0]/d[2], d[1]/d[2]];
            });  
    },
    snapToPerimeter: function(sites, diagram, width, height) {
        let snappedAny = false;
        // Sites that edges of Voronoi cells that lie on the perimeter of
        // the polygon will be snapped to the perimeter.
        diagram.edges.forEach(function(edge) {
            // Perimeter edges don't have a neighboring Voronoi site.
            if (typeof edge.right === 'undefined') {
                // If the site has already been snapped to the perimeter, skip it.
                if ( (sites[edge.left.index][0] > 0 && sites[edge.left.index][0] < width) &&
                     (sites[edge.left.index][1] > 0 && sites[edge.left.index][1] < height) ) {
                    snappedAny = true;
                    
                    // Move the site to the midpoint of the edge along the perimter.
                    sites[edge.left.index][0] = (edge[0][0] + edge[1][0])/2;
                    sites[edge.left.index][1] = (edge[0][1] + edge[1][1])/2;
                    
                    // Note: d3 returns a kind of weird Voronoi diagram that cuts
                    //       the corners of the cells in this edges array, rather
                    //       than include the full cell in user specified extent.
                    //       That is why we check 00 and 11 or 01 and 10 for extreme
                    //       values to push the site into a corner.
                    if ( (edge[0][0] > width || edge[0][0] < 0) && 
                         (edge[1][1] > height || edge[1][1] < 0) ) {
                        sites[edge.left.index][0] = edge[0][0];
                        sites[edge.left.index][1] = edge[1][1];
                    } else if ( (edge[1][0] > width || edge[1][0] < 0) && 
                                (edge[0][1] > height || edge[0][1] < 0) ) {
                        sites[edge.left.index][0] = edge[1][0];
                        sites[edge.left.index][1] = edge[0][1];
                    }
                }
            }
        });
        
        // Return if any vertices were moved.
        return snappedAny;
    }
}

export default PolygonUtils;