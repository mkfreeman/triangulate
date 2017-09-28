// Global variables
var height;
var width;
var BLUR_RADIUS = 0;
var NUM_POINTS = 500;
var img;
var voronoi;

// Function to build -- after image is uploaded
var build = function () {
    // Select image
    img = document.getElementById('my-img');
    var innerWidth = $(window).innerWidth();
    width = innerWidth < 700
        ? innerWidth * 0.9
        : innerWidth * 0.4;
    img.width = width;
    height = img.height;

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
    // Make Canvas elements (for photos)
    canvases.forEach(makeCanvas);

    // Append arrow on large screens
    if (innerWidth > 700) {
        $('.ele-container').append('<span>&#x2192;</span>');
        $('.upload-text').text('Upload Image');
    } else {
        $('.upload-text').text('Take Photo');
    }

    // Blur Canvases
    drawBlur();

    // Append canvases for triangles
    appendCanvases();
    canvases.map(drawTriangle);
};

// Canvases to draw
var canvases = [
    {
        id: 'heroCanvas',
        className: 'hero'
    }
];

// Function to make Canvas elements
var makeCanvas = function (can) {
    // Create canvas
    var canvas = document.createElement('canvas');
    canvas.id = can.id;
    canvas.className += can.className;
    canvas.width = width;
    canvas.height = height;

    // Draw image
    canvas
        .getContext('2d')
        .drawImage(img, 0, 0, width, height);
    document
        .getElementsByClassName('ele-container')[0]
        .appendChild(canvas);
}

// Blur the initial image
var drawBlur = function () {
    $('#blur-slider-label').text("Blur: " + BLUR_RADIUS);
    var canvas = document.getElementById('heroCanvas');
    canvas
        .getContext('2d')
        .drawImage(img, 0, 0, width, height);
    stackBlurCanvasRGBA('heroCanvas', 0, 0, width, height, BLUR_RADIUS);
};

// Append canvas elements to draw in
var appendCanvases = function () {
    canvases
        .forEach(function (can) {
            d3
                .select('.ele-container')
                .append('canvas')
                .attr('width', width)
                .attr('height', height)
                .attr('id', 'can-' + can.id)
                .attr("class", "triangles " + can.id);

        });
};

// Function to get color from the triangle
var getColor = function (d, c) {
    // Get triangle center
    var x = 0;
    var y = 0;
    d.forEach(function (dd) {
        x += dd[0];
        y += dd[1];
    });
    x = x / 3;
    y = y / 3;

    // Get color
    var pixelData = document
        .getElementById('heroCanvas')
        .getContext('2d')
        .getImageData(x, y, 1, 1)
        .data;
    var color = 'rgba(' + pixelData[0] + ',' + pixelData[1] + ',' + pixelData[2] + ',' + pixelData[3] + ')';
    return color;
};

// Function to draw a cell
var drawCell = function (cell, con) {
    if (!cell || !con) 
        return false;
    
    // Draw path
    con.beginPath();
    con.moveTo(cell[0][0], cell[0][1]);
    for (var j = 1, m = cell.length; j < m; ++j) {
        con.lineTo(cell[j][0], cell[j][1]);
    }

    // Fill path
    con.fillStyle = getColor(cell);
    con.strokeStyle = '#d3d3d3';
    con.lineWidth = .5;
    con.fill();
    con.stroke();
    con.closePath();
    return true;
}

// Function to draw triangles
var drawTriangle = function (can) {
    // Sample points
    var sites = d3
        .range(NUM_POINTS)
        .map(function (d) {
            return [
                Math.random() * width,
                Math.random() * height
            ];
        });

    var polygons = voronoi(sites).triangles();

    // Clear canvas
    var canvas = document.getElementById("can-" + can.id);
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paths!
    for (var i = 0, n = polygons.length; i < n; ++i) {
        drawCell(polygons[i], context);
    }

};