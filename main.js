// Main.js Global variables
var height = 500;
var width = 500;
var BLUR_RADIUS = 0;
var NUM_POINTS = 1000;
var img;

// Function to build -- after image is uploaded
var build = function() {
    // Select image
    img = document.getElementById('my-img');

    // Make Canvas elements (for photos)
    canvases.forEach(makeCanvas)

    // Append arrow
    $('.ele-container').append('<span>&#x2192;</span>')

    // Blur Canvases
    drawBlur();

    // Append svgs (for triangles)
    appendCanvases();
    canvases.map(drawTriangle);
};

// Canvases to draw
var canvases = [{
    id: 'heroCanvas',
    className: 'hero'
}];

// Function to make Canvas elements
var makeCanvas = function(can) {
    console.log('make canvas ', img)
    var canvas = document.createElement('canvas');
    canvas.id = can.id;
    canvas.className += can.className;
    canvas.width = width;
    canvas.height = height;
    canvas
        .getContext('2d')
        .drawImage(img, 0, 0, width, height);
    document
        .getElementsByClassName('ele-container')[0]
        .appendChild(canvas);
}
// canvases.forEach(makeCanvas) Blur the canvas
var drawBlur = function() {
    var canvas = document.getElementById('heroCanvas');
    canvas
        .getContext('2d')
        .drawImage(img, 0, 0, width, height);
    stackBlurCanvasRGBA('heroCanvas', 0, 0, width, height, BLUR_RADIUS);
};

// Function to draw Path
var drawPath = function(tri, can) {
    var canvas = document.getElementById(can);
    tri
        .attr("d", function(d) {
            return "M" + d.join("L") + "Z";
        })
        .style("fill", function(d) {
            var x = 0;
            var y = 0;
            d.forEach(function(dd) {
                x += dd[0];
                y += dd[1];
            })
            x = x / 3;
            y = y / 3;
            var pixelData = canvas
                .getContext('2d')
                .getImageData(x, y, 1, 1)
                .data;
            return 'rgba(' + pixelData.toString() + ')';
        });
}
var appendCanvases = function() {
    canvases
        .forEach(function(can) {
            d3
                .select('.ele-container')
                .append('canvas')
                .attr('width', width)
                .attr('height', height)
                .attr('id', 'can-' + can.id)
                .attr("class", "triangles " + can.id)

        })
}

// Function to get color from the triangle
var getColor = function(d, c) {
    var x = 0;
    var y = 0;
    d.forEach(function(dd) {
        x += dd[0];
        y += dd[1];
    })
    x = x / 3;
    y = y / 3;
    var pixelData = document.getElementById('heroCanvas')
        .getContext('2d')
        .getImageData(x, y, 1, 1)
        .data;
    return 'rgba(' + pixelData.toString() + ')';
}
// Function to draw a cell
function drawCell(cell, con) {
    if (!cell || !con) return false;
    con.beginPath();
    con.moveTo(cell[0][0], cell[0][1]);
    for (var j = 1, m = cell.length; j < m; ++j) {
        con.lineTo(cell[j][0], cell[j][1]);
    }
    con.closePath();
    con.fillStyle = getColor(cell);
    con.strokeStyle = 'none';
    con.fill();
    // con.stroke();
    return true;
}
// Function to draw triangles
var drawTriangle = function(can) {
    // var voronoi = d3.voronoi();
    var sites = d3.range(NUM_POINTS)
        .map(function(d) {
            return [Math.random() * width, Math.random() * height];
        });

    var voronoi = d3.voronoi()
        .extent([
            [-1, -1],
            [width + 1, height + 1]
        ]);

    var diagram = voronoi(sites),
        links = diagram.links(),
        polygons = diagram.triangles();

    var canvas = document.getElementById("can-" + can.id);
    var context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height);


    // Draw paths!
    for (var i = 0, n = polygons.length; i < n; ++i) drawCell(polygons[i], context);
};

// Change events
$('#blur-size input').val(BLUR_RADIUS)
$('#num-points input').val(NUM_POINTS)
$('#blur-size input').on('change', function(value) {
    BLUR_RADIUS = this.value;
    drawBlur();
    canvases.map(drawTriangle)
});

// Number of triangle points
$('#num-points input').on('change', function(value) {
    NUM_POINTS = this.value;
    // sites = getSites();
    canvases.map(drawTriangle)
});

// File uploader
$("#file").change(function() {
    // New file reader
    var reader = new FileReader();
    // Empty the container -- a little lazy
    $('.ele-container').empty();
    $('canvas').remove();
    reader.onloadend = function(e) {
        img = document.getElementById('my-img');
        img.src = e.target.result;
        // Unsure why this is necessary to setTimeout
        setTimeout(build, 1)
    };

    reader.readAsDataURL(this.files[0]);

});
// Wait for image to load
$(window).on("load", function() {
    build();
    $('.modal').modal();
});
$(".button-collapse").sideNav();