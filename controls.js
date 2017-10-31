$(function () {
    // Initialize collapse button
    $(".button-collapse").sideNav();
    $('.button-collapse').sideNav('show');
    $('.collapsible').collapsible();
    $('select').material_select();

    // File uploader
    $("#file").change(function () {
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
        console.log('download canvas!')
        link.href = document
            .getElementById(canvasId)
            .toDataURL();
        link.download = filename;
    }

    // Download
    document
        .getElementById('download')
        .addEventListener('click', function () {
            console.log('click!', this)
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

    $("#type-select-menu").on('change', function (value) {
        console.log('value', this.value);
        ELEMENT_TYPE = Number(this.value);
        finalImageOutOfDate = true;
        build();
    })

    $("#smooth-select-menu").on('change', function (value) {
        SMOOTH_TYPE = this.value;
        smoothingOutOfDate = true;
        build();
    })

    var getTypeString = function (value) {
        if (value == 0) 
            return 'Triangle';
        if (value == 1) 
            return 'Polygon';
        return 'Dot';
    };

    // Lines
    $('#lines').on('change', function (value) {
        console.log(value, this.value,)
        let val = $(this).prop('checked') == false
            ? 0
            : 1;
        BORDER_LINES = val;
        finalImageOutOfDate = true;
        build();
    })

    var getEnabledString = function (value) {
        if (value == 0) 
            return 'Off';
        return 'On';
    };

    // Colors
    $("input:radio[name=color]").on('change', function (value) {
        console.log(value)
        COLOR_TYPE = this.value != 'average'
            ? 0
            : 1;
        finalImageOutOfDate = true;
        console.log('color type', COLOR_TYPE)
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
