$(function() {
    // Initialize collapse button
    $(".button-collapse").sideNav();
    $(".button-collapse").sideNav('show');
    $('select').material_select();

    // Function to load image
    function GetImage(img) {
        // Empty the container -- a little lazy
        $('.ele-container').empty();
        $('#img-container').empty();
        $('canvas').remove();
        img.id = "rawCanvas";
        img.className += "hero";
        document.getElementById('img-container').appendChild(img);
        originalSize = {
            width: document.getElementById('rawCanvas').width,
            height: document.getElementById('rawCanvas').height
        };
        imageOutOfDate = true;
        build();
    }
    // Load image
    document.getElementById('file').onchange = function(e) {
        var loadingImage = loadImage(
            e.target.files[0],
            GetImage,
            {
                orientation: true,
                canvas: true
            }
        );
    };


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
        .on('set', function(value) {
            BLUR_RADIUS = Math.floor(value);
            blurOutOfDate = true;
            build();
        });

    blurSlider
        .noUiSlider
        .on('update', function(value) {
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
            max: 20000
        }
    });

    pointsSlider
        .noUiSlider
        .on('set', function(value) {
            NUM_POINTS = Math.floor(value);
            sitesOutOfDate = true;
            build();
        });

    pointsSlider
        .noUiSlider
        .on('update', function(value) {
            $('#points-slider-label').text('# of points: ' + Math.floor(value));
        });

    // Number of triangles slider
    var thresholdSlider = document.getElementById('threshold-slider');
    noUiSlider.create(thresholdSlider, {
        start: THRESHOLD,
        animate: false,
        step: 1,
        range: {
            min: 0,
            max: 250
        }
    });

    thresholdSlider
        .noUiSlider
        .on('set', function(value) {
            THRESHOLD = Math.floor(value);
            finalImageOutOfDate = true;
            build();
        })
    thresholdSlider.setAttribute('disabled', true);

    // Smoother
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
        .on('set', function(value) {
            SMOOTH_ITERATIONS = Math.floor(value);
            smoothingOutOfDate = true;
            build();
        });

    smoothSlider
        .noUiSlider
        .on('update', function(value) {
            $('#smooth-slider-label').text('Re-sample to Distribute Points : ' + Math.floor(value));
        });

    $("#type-select-menu").on('change', function(value) {
        ELEMENT_TYPE = Number(this.value);
        finalImageOutOfDate = true;
        build();
    })

    $("#smooth-select-menu").on('change', function(value) {
        SMOOTH_TYPE = this.value;
        smoothingWeightOutOfDate = true;
        smoothingOutOfDate = true;
        build();
    })

    var getTypeString = function(value) {
        if (value == 0)
            return 'Triangle';
        if (value == 1)
            return 'Polygon';
        return 'Dot';
    };

    // Lines
    $('#lines').on('change', function(value) {
        let val = $(this).prop('checked') == false
            ? 0
            : 1;
        BORDER_LINES = val;
        finalImageOutOfDate = true;
        build();
    })

    // Black and white
    $('#black-white').on('change', function(value) {
        let val = $(this).prop('checked') == false
            ? 0
            : 1;
        // Disable/enable other black and white options        
        var disabled = $(this).prop('checked') == false ? true : false;
        if (disabled == true) {
            $('#invert').prop('disabled', true);
            $('#invert').prop('checked', false);
            thresholdSlider.setAttribute('disabled', true);
            INVERT = 0;
        } else {
            $('#invert').prop('disabled', false);
            thresholdSlider.removeAttribute('disabled');
        }

        BLACK_WHITE = val;
        finalImageOutOfDate = true;
        build();
    })

    // Black and white
    $('#invert').on('change', function(value) {
        let val = $(this).prop('checked') == false
            ? 0
            : 1;
        INVERT = val;
        finalImageOutOfDate = true;
        build();
    })
    var getEnabledString = function(value) {
        if (value == 0)
            return 'Off';
        return 'On';
    };

    // Colors
    $("input:radio[name=color]").on('change', function(value) {
        COLOR_TYPE = this.value != 'average'
            ? 0
            : 1;
        finalImageOutOfDate = true;
        build();
    })

    // Size
    $("input:radio[name=size]").on('change', function(value) {
        FIT_TO_SCREEN = this.value != 'original'
            ? true
            : false;
        imageOutOfDate = true;
        build();
    })

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
        .on('set', function(value) {
            NUM_RESAMPLE = Math.floor(value);
            sitesOutOfDate = true;
            build();
        });

    resampleSlider
        .noUiSlider
        .on('update', function(value) {
            $('#resample-slider-label').text('Resample for Contrast: ' + Math.floor(value));
        });


    var blendSlider = document.getElementById('blend-slider');
    noUiSlider.create(blendSlider, {
        start: NUM_BLEND,
        animate: false,
        step: 1,
        range: {
            min: 0,
            max: 100
        }
    });

    blendSlider
        .noUiSlider
        .on('set', function(value) {
            NUM_BLEND = Math.floor(value);
            finalImageOutOfDate = true;
            build();
        });

    blendSlider
        .noUiSlider
        .on('update', function(value) {
            $('#blend-slider-label').text('Blend Image: ' + Math.floor(value) + '%');
        });

    // Wait for image to load
    $(window).on("load", function() {
        // Get original image size        
        $('.modal').modal();
        loadImage(
            './imgs/mountains.png',
            GetImage,
            {
                orientation: true,
                canvas: true
            }
        );
    });


    $('#points-slider-label').text('# of Cells: ' + NUM_POINTS);
});
