/* Control Settings

Set `id` as **state** object to manipulate */
const ControlSettings = [
    {
        id: 'image-header',
        type: 'header',
        label: "Image Options"
    }, {
        id: 'shape',
        type: 'select',
        label: "Shape",
        options: [
            {
                id: "points",
                label: "Points"
            }, {
                id: "triangles",
                label: "Triangles"
            }, {
                id: "polygons",
                label: "Polygons"
            }
        ]
    }, {
        id: 'numPoints',
        type: 'slider',
        getLabel: (num) => "# of Points: " + num,
        min: 10,
        max: 20000,
        step: 100
    }, {
        id: 'fitToScreen',
        label: "Fit Image To Screen",
        type: 'checkbox'
    }, {
        id: 'showLines',
        label: "Show Polygon Outlines",
        type: 'checkbox'
    }, {
        id: 'blend',
        type: 'slider',
        getLabel: (num) => "Blend Original Image:" + num + "%",
        min: 0,
        max: 100,
        step: 1
    }, {
        id: 'color-header',
        type: 'header',
        label: "Color Options"
    }, {
        id: "fillColor",
        type: 'radio',
        options: [
            {
                id: "centroid",
                label: "Center Color"
            }, {
                id: "average",
                label: "Average Color"
            }
        ]
    }, {
        id: 'blackWhite',
        label: "Black and White",
        type: 'toggle'
    }, {
        id: 'invert',
        label: "Invert Black and White",
        getDisabled: (d) => d,
        type: 'toggle'
    }, {
        id: 'threshold',
        getLabel: (num) => "Black/White Threshold: " + num,
        type: 'slider',
        min: 50,
        max: 250,
        step: 1,
        getDisabled: (d) => d
    }, {
        id: 'smoothing-header',
        type: 'header',
        label: "Smoothing Options"
    }, {
        id: 'contrast',
        type: 'slider',
        getLabel: (num) => "Re-sample for Contrast:" + num + "times",
        min: 0,
        max: 200,
        step: 1
    }, {
        id: 'distribute',
        type: 'slider',
        getLabel: (num) => "Re-sample to Distribute Points:" + num + "times",
        min: 0,
        max: 200,
        step: 1
    }, {
        id: 'blur',
        type: 'Slider',
        getLabel: (num) => "Blur is " + num,
        min: 0,
        max: 100,
        step: 1
    }, {
        id: 'algorithm',
        type: 'select',
        label: "Smoothing Algorithm",
        options: [
            {
                id: "lloyd",
                label: "Lloyd"
            }, {
                id: "vertex",
                label: "Polygon Vertex"
            }, {
                id: "laplacian",
                label: "Laplacian"
            }
        ]
    }
];

export default ControlSettings;