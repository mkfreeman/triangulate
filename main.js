// Global variables
var height;
var width;
var BLUR_RADIUS = 0;
var NUM_POINTS = 500;
var NUM_RESAMPLE = 0;
var SMOOTH_ITERATIONS = 0;
var ELEMENT_TYPE = 0;
var BORDER_LINES = 1;
var SMOOTH_TYPE = 0;
var COLOR_TYPE = 0;
var BLACK_WHITE = 0;
var THRESHOLD = 128;
var FIT_TO_SCREEN = true;
var SCALE = 1;
var originalSize;
var INVERT = 0;
var NUM_BLEND = 0;
var img;
var voronoi;
var sites;
var smoothedSites;
var imageBuffer8;

var imageOutOfDate = true;
var blurOutOfDate = true;
var sitesOutOfDate = true;
var smoothingOutOfDate = true;
var finalImageOutOfDate = true;

// the main procedure here is:
// 1. Set the input image on the canvas
// 2. Blur the image
// 3. Get the voronoi sites (getSites)
// 4. Extract the image data for sampling
// 5. Smooth the voronoi diagram
// 6. Build the final image (triangles, polygons, or dots)
//
// The goal of the above state variables is to keep track of what things need to
// be recomputed yet still provide a single entry point to the main computation
// pipeline (build).
//

// Download button
function downloadCanvas(link, canvasId, filename) {
    var canvas = document.getElementById(canvasId);

    // Convert to blob and download
    canvas.toBlob(function(blob) {
        url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
    });
}

// Function to build -- after image is uploaded
var build = function() {
    if (imageOutOfDate) {
        // update the image on the canvas
        updateImage();
    }

    if (blurOutOfDate) {
        // Blur Canvases
        drawBlur();

        // Get all the image data at once since getImageData() calls seem to be a little
        // slow -- it seems to be much faster this way.
        getAllImageData();
    }

    if (sitesOutOfDate) {
        // Set (initial) sites
        sites = getSites();
    }

    if (smoothingOutOfDate) {
        // smooth the sites
        smoothedSites = smoothSites();
    }

    if (finalImageOutOfDate) {
        canvases.map(drawFinalImage);
    }

    // Set download for updated image
    // Wait for it to load...?
    setTimeout(function() {
        downloadCanvas(document.getElementById('download'), 'can-heroCanvas', 'triangle-image.png');
    }, 300)

};

//
// Update the input image
//
var updateImage = function() {

    img = document.getElementById('rawCanvas');
    var wrapper = document.getElementsByClassName('ele-container')[0];
    var widthOffset = document.documentElement.clientWidth < 992 ? 0 : 300;
    var w = Math.floor(document.documentElement.clientWidth - widthOffset);
    var h = Math.floor(document.documentElement.clientHeight - 10);
    if (FIT_TO_SCREEN == true) {
        // Maximize area of photo
        let imageRatio = img.width / img.height;
        let screenRatio = w / h;
        SCALE = Math.min(w / img.width, h / img.height)
        if (imageRatio > screenRatio) {
            width = Math.floor(w);
            height = Math.floor(img.height * SCALE);
        } else {
            height = Math.floor(h);
            width = Math.floor(img.width * SCALE);
        }
    } else {
        height = originalSize.height;
        width = originalSize.width;
    }

    // Make Canvas elements (for photos)

    canvases.forEach(function(d) {
        makeCanvas(d, document.getElementById('rawCanvas'))
    });

    // Define voronoi function
    voronoi = d3
        .voronoi()
        .extent([
            [
                -1, -1
            ],
            [
                width + 1,
                height + 1
            ]
        ]);

    // Append arrow on large screens
    if (innerWidth > 700) {
        $('.upload-text').text('Upload Image');
    } else {
        $('.upload-text').text('Take Photo');
    }

    // Append canvases for triangles
    appendCanvases();

    // redo everything
    imageOutOfDate = false;
    blurOutOfDate = true;
    sitesOutOfDate = true;
}

// Given a point (pt = [x, y]) find the offset in the pixel array where the rgba
// data lives.
var getImageOffset = function(pt) {
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
}

var imageDiffSq = function(off1, off2) {
    var r = imageBuffer8[off1] - imageBuffer8[off2];
    var b = imageBuffer8[off1 + 1] - imageBuffer8[off2 + 1];
    var g = imageBuffer8[off1 + 2] - imageBuffer8[off2 + 2];
    return r * r + b * b + g * g;
}

// Approximate the image gradient at a point in the input image, which is used
// when resampling to get more vertices near parts of the image with more
// variation.
var approximateGradient = function(pt, d) {
	var off = getImageOffset(pt);
	var offpx = getImageOffset([
		pt[0] + d, pt[1]
	]);
	var offmx = getImageOffset([
		pt[0] - d, pt[1]
	]);
	var offpy = getImageOffset([
		pt[0], pt[1] + d
	]);
	var offmy = getImageOffset([
		pt[0], pt[1] - d
	]);
	return imageDiffSq(offpx, off) + imageDiffSq(offmx, off) + imageDiffSq(offpy, off) + imageDiffSq(offmy, off);
}

//
// Generate Voronoi sites. This includes resampling (if specified by the user)
// which chooses the point with largest variation in the input image over a set
// of randomly selected points.
//
var getSites = function() {
    sitesOutOfDate = false;
    smoothingOutOfDate = true;

    var radius = Math.sqrt(width * height / NUM_POINTS) / 2;
    if (radius < 1)
        radius = 1;
    return d3
        .range(NUM_POINTS)
        .map(function(d) {
            var pt = [
                Math.random() * width,
                Math.random() * height
            ];
            var score = approximateGradient(pt, radius);
            for (var i = 0; i < NUM_RESAMPLE; ++i) {
                var newPt = [
                    Math.random() * width,
                    Math.random() * height
                ];
                var newScore = approximateGradient(newPt, radius);
                if (newScore > score)
                    pt = newPt;
            }
            return pt;
        });
};

// Construct an empty array of Voronoi sites.
var getEmptySitesArray = function() {
    return d3
        .range(NUM_POINTS)
        .map(function(d) {
            return [0.0, 0.0];
        });
};

// Extract the full image from the input  canvas.
// Note: this function extract the full image buffer in a single    call to
// getImageData. Calling getImageData many times to extract    data one pixel at
// a time seems to be much slower.
var getAllImageData = function() {
    var context = document
        .getElementById('heroCanvas')
        .getContext('2d');
    var myGetImageData = context.getImageData(0, 0, width, height);
    imageBuffer8 = new Uint8Array(myGetImageData.data.buffer);
};

// Canvases to draw
var canvases = [
    {
        id: 'heroCanvas',
        className: 'hero'
    }
];

// Function to make Canvas elements
var makeCanvas = function(can, srcImg) {
    // Create canvas, if it doesn't exist
    var canvas;
    if (document.getElementById(can.id) == null) {
        canvas = document.createElement('canvas');
        canvas.id = can.id;
        canvas.className += can.className;

        // Append
        document
            .getElementsByClassName('ele-container')[0]
            .appendChild(canvas);
    } else {
        canvas = document.getElementById(can.id)
    }


    canvas.width = width;
    canvas.height = height;

    // Draw image

    var ctx = srcImg.getContext('2d')
    var original = ctx.getImageData(0, 0, width, height);

    var ctx = canvas
        .getContext('2d')
    // ctx.scale(SCALE, SCALE);
    ctx.drawImage(img, 0, 0, width, height);
};

// Blur the initial image
var drawBlur = function() {
    var c = document.getElementById('heroCanvas');
    c
        .getContext('2d')
        .drawImage(img, 0, 0, width, height);
    StackBlur.canvasRGB(c, 0, 0, width, height, BLUR_RADIUS);

    blurOutOfDate = false;
    finalImageOutOfDate = true;

};

// Append canvas elements to draw in
var appendCanvases = function() {
    var drawingContainers = d3.select('.ele-container').selectAll('.triangles').data(canvases)

    drawingContainers.enter()
        .append('canvas')
        .merge(drawingContainers)
        .attr('width', width)
        .attr('height', height)
        .attr('id', function(d) {
            return 'can-' + d.id
        })
        .attr("class", function(d) {
            return 'triangles ' + d.id
        })
// .attr('scale', [5, 5])
};

// Get specific data out of the image buffer for a particular pixel (x,y) and
// rgba component (i).
var getPixelDataAtPos = function(x, y, i) {
    return imageBuffer8[4 * (x + y * width) + i];
}

var makeColorString = function(r, g, b, a) {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

// get color at a position in the image
var getColorAtPos = function(pt) {
    // Get color
    var offset = getImageOffset(pt);
    var color = makeColorString(imageBuffer8[offset], imageBuffer8[offset + 1], imageBuffer8[offset + 2], imageBuffer8[offset + 3]);
    // Calculate luminence
    if (BLACK_WHITE == 1) {
        var y = 0.2126 * imageBuffer8[offset] + 0.7152 * imageBuffer8[offset + 1] + 0.0722 * imageBuffer8[offset + 2]
        var test = INVERT == 0 ? y < THRESHOLD : y > THRESHOLD
        var color = test ? 'black' : 'white'
    }
    return color;
}

var getAverageColor = function(c, p) {
    var r = 0;
    var g = 0;
    var b = 0;
    var a = 0;
    var offset = getImageOffset(c);
    r += p.length * imageBuffer8[offset];
    g += p.length * imageBuffer8[offset + 1];
    b += p.length * imageBuffer8[offset + 2];
    a += p.length * imageBuffer8[offset + 3];

    p.forEach(function(pt) {
        offset = getImageOffset(pt);
        r += imageBuffer8[offset];
        g += imageBuffer8[offset + 1];
        b += imageBuffer8[offset + 2];
        a += imageBuffer8[offset + 3];
    });

    r /= (2 * p.length);
    g /= (2 * p.length);
    b /= (2 * p.length);
    a /= (2 * p.length);
    var color = makeColorString(Math.round(r), Math.round(g), Math.round(b), Math.round(a));
    if (BLACK_WHITE == 1) {
        var y = 0.2126 * r + 0.7152 * g + 0.0722 * b
        var test = INVERT == 0 ? y < THRESHOLD : y > THRESHOLD
        var color = test ? 'black' : 'white'
    }
    return color;
}

// Function to get color from the triangle / polygon. This can either just
// sample at the centroid or average  over the centroid and the polygon
// vertices.
var getColor = function(d) {
    var centroid = polygonCentroid(d);
    if (COLOR_TYPE == 0)
        return getColorAtPos(centroid);

    return getAverageColor(centroid, d);
};

var getDotColor = function(pt, r) {
    if (COLOR_TYPE == 0)
        return getColorAtPos(pt);

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

    return getAverageColor(pt, pts);
};

// several functions below are utilties for the various smoothing methods
var polygonArea = function(polygon) {
    var area = 0;
    var n = polygon.length;
    var j = n - 1;
    for (var i = 0; i < n; j = i++) {
        area += polygon[i][0] * polygon[j][1];
        area -= polygon[i][1] * polygon[j][0];
    }
    area /= 2;
    return area;
};

var polygonCentroid = function(polygon) {
    var n = polygon.length;
    var x = 0;
    var y = 0;
    var j = n - 1;
    for (var i = 0; i < n; j = i++) {
        var tmp = polygon[i][0] * polygon[j][1] - polygon[j][0] * polygon[i][1];
        x += (polygon[i][0] + polygon[j][0]) * tmp;
        y += (polygon[i][1] + polygon[j][1]) * tmp;
    }
    var sixA = polygonArea(polygon) * 6;
    return [
        x / sixA,
        y / sixA
    ];
};

//  Function to get polygon centroid
var getPolygonCentroids = function(polygons) {
    return polygons.map(function(p) {
        return polygonCentroid(p);
    });
}

var getLaplacianSmoothedSites = function(diagram) {
    var tmpSites = getEmptySitesArray();
    var totalWeights = tmpSites.map(function(s) {
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
}

var polygonVertexAverage = function(polygon) {
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
}

var getPolygonVertexAverages = function(polygons) {
    return polygons.map(function(p) {
        return polygonVertexAverage(p);
    });
}

// Update sites using a weighted Lloyd's algorithm. By using
// image contrast as the weight, this method tends to snap
// sites to edges in the image and can give a really high
// quality (i.e., less abstract) result for the triangle or
// dot based images.
var getWeightedSites = function(inputSites, weights) {

    // initialize the result to contain the original sites so that
    // if a polygon contains no weight, then the site doesn't move
    var weightedCentroidData = inputSites.map(function(d) {
			return [inputSites[0], inputSites[1] , 0.0]; 
		});
        
    var diagram = voronoi(inputSites);
    
    // Perform the weighted centroid calculation by integrating over 
    // the entire image and accumulating the integral for the relevant
    // polygon.
    for (var iW =0; iW < width; ++iW) {
        for (var iH=0; iH < height; ++iH) {            
            var site = diagram.find(iW, iH).index; // find which polygon contains this pixel
            var weight = weights[iW*height+iH];
            if (weight > 0.0) {
                if (weightedCentroidData[site][2] == 0.0) {
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
			return [d[0]/d[2], d[1]/d[2]];
		});  
}
//
// Smooth the Voronoi diagram via one of several (albeit similar) methods: Lloyd
// iteration (moving sites to polygon centroids), Laplacian smoothing (moving
// sites to the average of their neighboring sites) and "Polygon vertex average"
// which moves a site to the average of the vertices of the Voronoi polygon.
//
var smoothSites = function() {    
    var newSites = sites.map(function(s) { return s; });
    
    // Precompute smoothing weights since they don't change from iteration
    // to iteration. We only need these in the "contrast weighted" smoothing
    // mode but we could experiment with coming up with some different weights
    // here in the future.
    var weights = []; 
    if (SMOOTH_TYPE == 3) {
        for (var iW =0; iW < width; ++iW) {
            for (var iH=0; iH < height; ++iH) {         
                weights.push(approximateGradient([iW, iH], 1) + 1.0);
            }
        }
    }

	for (var i = 0; i < SMOOTH_ITERATIONS; ++i) {

		if (SMOOTH_TYPE == 0) {
			var polygons = voronoi(newSites).polygons();
			newSites = getPolygonCentroids(polygons);
		} else if (SMOOTH_TYPE == 1) {
			var diagram = voronoi(newSites);
			newSites = getLaplacianSmoothedSites(diagram);
		} else if (SMOOTH_TYPE == 2) {
			var polygons = voronoi(newSites).polygons();
			newSites = getPolygonVertexAverages(polygons);
		} else if (SMOOTH_TYPE == 3) {
			newSites = getWeightedSites(newSites, weights);
		}
	}
    
	smoothingOutOfDate = false;
	finalImageOutOfDate = true;

	return newSites;
}

// Function to draw a cell
var drawCell = function(cell, con) {
    if (!cell || !con)
        return false;

    // Draw path
    con.beginPath();
    con.moveTo(cell[0][0], cell[0][1]);
    for (var j = 1, m = cell.length; j < m; ++j) {
        con.lineTo(cell[j][0], cell[j][1]);
    }

    // Fill path
    var color = getColor(cell);
    con.fillStyle = color;
    con.strokeStyle = color;
    con.lineWidth = 1.25;
    con.fill();
    if (con.fillStyle != '#ffffff') {
        con.stroke();
    }
    con.closePath();
    return true;
};

// Function to draw a cell
var drawLines = function(cell, con) {
    if (!cell || !con)
        return false;

    // Draw path
    con.beginPath();
    con.moveTo(cell[0][0], cell[0][1]);
    for (var j = 1, m = cell.length; j < m; ++j) {
        con.lineTo(cell[j][0], cell[j][1]);
    }
    con.strokeStyle = '#d3d3d3';
    con.lineWidth = .5;
    con.stroke();
    con.closePath();
    return true;
};


var getDotRadii = function(sites, diagram) {

    // first compute the distance to the nearest and furthest Voronoi neighbors
    var minDist = [];
    var maxDist = [];
    var radii = [];
    sites.forEach(function(site) {
        minDist.push(width + height);
        maxDist.push(0.0);
        radii.push(0.0);
    });

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

    return radii;
}

// Function to draw a cell
var drawDot = function(site, radius, con) {
    var color = getDotColor(site, radius);

    con.beginPath();
    con.arc(site[0], site[1], radius, 0, 2 * Math.PI);
    con.closePath();
    con.fillStyle = color;
    con.strokeStyle = color;
    con.lineWidth = 0;
    con.fill();
}

// blend in the original image
var blendOriginalImage = function(context) {
    if (NUM_BLEND == 0)
        return;

    var imageData = context.getImageData(0, 0, width, height);
    var data = imageData.data;

    for (var i = 0; i < data.length; i += 1) {
        data[i] = ((100 - NUM_BLEND) * data[i] + NUM_BLEND * imageBuffer8[i]) / 100;
    }
    context.putImageData(imageData, 0, 0);
}

// Function to draw triangles
var drawFinalImage = function(can) {
    // Clear canvas
    var canvas = document.getElementById("can-" + can.id);
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (ELEMENT_TYPE == 2) {
        // draw the stippled image
        radii = getDotRadii(smoothedSites, voronoi(smoothedSites));
        for (var i = 0, n = smoothedSites.length; i < n; ++i) {
            drawDot(smoothedSites[i], radii[i], context);
        }

        blendOriginalImage(context);

    } else {
        var polygons;
        if (ELEMENT_TYPE == 0) {
            // get the Delaunay triangles
            polygons = voronoi(smoothedSites).triangles();
        } else if (ELEMENT_TYPE == 1) {
            // get the Voronoi polygons
            polygons = voronoi(smoothedSites).polygons();
        }

        for (var i = 0, n = polygons.length; i < n; ++i) {
            drawCell(polygons[i], context);
        }

        blendOriginalImage(context);

        if (BORDER_LINES == 1) {
            for (var i = 0, n = polygons.length; i < n; ++i) {
                drawLines(polygons[i], context);
            }
        }
    }

    finalImageOutOfDate = false;
};
