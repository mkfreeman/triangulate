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
    var pointsSlider = document.getElementById('points-slider');
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
            drawBlur();
            canvases.map(drawTriangle);
        });

    blurSlider
        .noUiSlider
        .on('update', function (value) {
            $('#blur-slider-label').text('Blur: ' + Math.floor(value));
        });

    // Number of triangles slider
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
            sites = getSites();
            canvases.map(drawTriangle);
        });

    pointsSlider
        .noUiSlider
        .on('update', function (value) {
            $('#points-slider-label').text('Num. Triangles: ' + Math.floor(value));
        });

    // Wait for image to load
    $(window).on("load", function () {
        build();
        $('.modal').modal();
    });
    $('#points-slider-label').text('Num. Triangles: ' + NUM_POINTS);
});
