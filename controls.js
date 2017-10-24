$(function () {
    // File uploader
    $("#file")
        .change(function () {
            // New file reader
            var reader = new FileReader();
            // Empty the container -- a little lazy
            $('.ele-container').empty();
            $('canvas').remove();
            reader.onloadend = function (e) {
                img = $('#my-img');
                img.attr('src', e.target.result);
                img.one("load", function () {
					imageOutOfDate = true;
                    build();
                })
                    .each(function () {
                        if (this.complete) 
                            $(this).load();
                        }
                    );
            };
            reader.readAsDataURL(this.files[0]);
        });

    // Download button
    function downloadCanvas(link, canvasId, filename) {
        link.href = document
            .getElementById(canvasId)
            .toDataURL();
        link.download = filename;
    }

    // Download
    document
        .getElementById('download')
        .addEventListener('click', function () {
            downloadCanvas(this, 'can-heroCanvas', 'triangle-image.png');
        }, false);

    // Blur slider
    var blurSlider = document.getElementById('blur-slider');
	
    noUiSlider.create(blurSlider, {
        start: BLUR_RADIUS,
        animate: false,
        step: 1,
        range: {
            min: 0,
            max: 50
        }
    });

    blurSlider
        .noUiSlider
        .on('set', function (value) {
            BLUR_RADIUS = Math.floor(value);
			blurOutOfDate = true;
			build();
        });

    blurSlider
        .noUiSlider
        .on('update', function (value) {
            $('#blur-slider-label').text('Blur: ' + Math.floor(value));
        });

    // Number of triangles slider
    var pointsSlider = document.getElementById('points-slider');
    noUiSlider.create(pointsSlider, {
        start: NUM_POINTS,
        animate: false,
        step: 1,
        range: {
            min: 10,
            max: 10000
        }
    });

    pointsSlider
        .noUiSlider
        .on('set', function (value) {
            NUM_POINTS = Math.floor(value);
			sitesOutOfDate = true;
			build();
        });

    pointsSlider
        .noUiSlider
        .on('update', function (value) {
            $('#points-slider-label').text('Num. Cells: ' + Math.floor(value));
        });

	var smoothSlider = document.getElementById('smooth-slider');		
	noUiSlider.create(smoothSlider, {
        start: SMOOTH_ITERATIONS,
        animate: false,
        step: 1,
        range: {
            min: 0,
            max: 20
        }
    });

    smoothSlider
        .noUiSlider
        .on('set', function (value) {
            SMOOTH_ITERATIONS = Math.floor(value);
			smoothingOutOfDate = true;
			build();
        });

    smoothSlider
        .noUiSlider
        .on('update', function (value) {
            $('#smooth-slider-label').text('Smoothing Iterations: ' + Math.floor(value));
        });	
		
	var typeSlider = document.getElementById('type-slider');		
	noUiSlider.create(typeSlider, {
        start: ELEMENT_TYPE,
        animate: false,
        step: 1,
        range: {
            min: 0,
            max: 1
        }
    });

    typeSlider
        .noUiSlider
        .on('set', function (value) {
            ELEMENT_TYPE = Math.floor(value);
			finalImageOutOfDate = true;
			build();
        });

    var getTypeString = function(value) {
        if (value == 0)
            return 'Triangle';
        return 'Polygon';
    };    
        
    typeSlider
        .noUiSlider
        .on('update', function (value) {
            $('#type-slider-label').text('Cell Type: ' + getTypeString(value));
        });		

	var borderSlider = document.getElementById('border-slider');        
	noUiSlider.create(borderSlider, {
        start: BORDER_LINES,
        animate: false,
        step: 1,
        range: {
            min: 0,
            max: 1
        }
    });

    borderSlider
        .noUiSlider
        .on('set', function (value) {
           BORDER_LINES = Math.floor(value);
			finalImageOutOfDate = true;
			build();
        });

    var getEnabledString = function(value) {
        if (value == 0)
            return 'Off';
        return 'On';
    };
        
    borderSlider
        .noUiSlider
        .on('update', function (value) {
            $('#border-slider-label').text('Lines: ' + getEnabledString(value));
        });		

    // slider to control the smoothing algorithm
	var smoothTypeSlider = document.getElementById('smoothType-slider');       
	noUiSlider.create(smoothTypeSlider, {
        start: SMOOTH_TYPE,
        animate: false,
        step: 1,
        range: {
            min: 0,
            max: 2
        }
    });

    smoothTypeSlider
        .noUiSlider
        .on('set', function (value) {
           SMOOTH_TYPE = Math.floor(value);
			smoothingOutOfDate = true;
			build();
        });

    var getSmoothingTypeString = function(value) {
        if (value == 0)
            return 'Lloyd';
        else if (value == 1)
            return 'Laplacian';
        else if (value == 2)
            return 'Polygon Vertex Average';
        return 'Unknown';
    }; 
       
    smoothTypeSlider
        .noUiSlider
        .on('update', function (value) {
            $('#smoothType-slider-label').text('Smoothing Type: ' + getSmoothingTypeString(value));
        });			
		
    // toggle to control if color is taken from centroid or an average
    // at the cell vertices
	var colorTypeSlider = document.getElementById('colorType-slider');		
	noUiSlider.create(colorTypeSlider, {
        start: COLOR_TYPE,
        animate: false,
        step: 1,
        range: {
            min: 0,
            max: 1
        }
    });

    colorTypeSlider
        .noUiSlider
        .on('set', function (value) {
           COLOR_TYPE = Math.floor(value);
			finalImageOutOfDate = true;
			build();
        });

    var getColorTypeString = function(value) {
        if (value == 0)
            return 'Centriod';
        return 'Average';
    };
        
    colorTypeSlider
        .noUiSlider
        .on('update', function (value) {
            $('#colorType-slider-label').text('Coloring: ' + getColorTypeString(value));
        });			

    // slider to control the number of resamples taken when determing the 
    // Voronoi sites
	var resampleSlider = document.getElementById('resample-slider');        
    noUiSlider.create(resampleSlider, {
        start: NUM_RESAMPLE,
        animate: false,
        step: 1,
        range: {
            min: 0,
            max: 200
        }
    });

    resampleSlider
        .noUiSlider
        .on('set', function (value) {
            NUM_RESAMPLE = Math.floor(value);
			sitesOutOfDate = true;
			build();
        });

    resampleSlider
        .noUiSlider
        .on('update', function (value) {
            $('#resample-slider-label').text('Num. Resamples: ' + Math.floor(value));
        });
	
		
    // Wait for image to load
    $(window).on("load", function () {
        build();
        $('.modal').modal();
    });
    $('#points-slider-label').text('Num. Cells: ' + NUM_POINTS);
});
