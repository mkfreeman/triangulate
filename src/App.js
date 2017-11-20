import React, {Component} from 'react';
import './App.css';
import ControlPanel from './ControlPanel';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const settings = {
    numPointsSlider: {
        min: 10,
        max: 20000,
        step: 1
    },
    blendSlider: {
        min: 0,
        max: 100,
        step: 1
    },
    thresholdSlider: {
        min: 50,
        max: 250,
        step: 1
    },
    contrastSlider: {
        min: 0,
        max: 200,
        step: 1
    },
    distributeSlider: {
        min: 0,
        max: 200,
        step: 1
    },
    blurSlider: {
        min: 0,
        max: 100,
        step: 1
    },
    typeOptions: [
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
    ],
    algorithmOptions: [
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
    ],
    fillColorOptions: [
        {
            id: "centroid",
            label: "Center Color"
        }, {
            id: "average",
            label: "Average Color"
        }
    ]
};

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numPoints: 1000,
            type: 'triangles',
            fitToScreen: true,
            showLines: true,
            blend: 50,
            fillColor: "average",
            blackWhite: false,
            invert: false,
            threshold: 178,
            contrast: 0,
            distribute: 0,
            algorithm: 'lloyd',
            blur: 0
        }

    }
    inputChangeHandler(event, id, newValue) {
        console.log(event, id, newValue)
        let obj = {};
        obj[id] = newValue;
        this.setState(obj);
    }
    render() {
        return (
            <MuiThemeProvider>
                <div>
                    <ControlPanel
                        numPoints={this.state.numPoints}
                        type={this.state.type}
                        blur={this.state.blur}
                        fillColor={this.state.fillColor}
                        blackWhite={this.state.blackWhite}
                        invert={this.state.invert}
                        contrast={this.state.contrast}
                        distribute={this.state.distribute}
                        threshold={this.state.threshold}
                        fitToScreen={this.state.fitToScreen}
                        showLines={this.state.showLines}
                        blend={this.state.blend}
                        algorithm={this.state.algorithm}
                        numPointsSettings={settings.numPointsSlider}
                        thresholdSettings={settings.thresholdSlider}
                        contrastSettings={settings.contrastSlider}
                        distributeSettings={settings.distributeSlider}
                        blendSettings={settings.blendSlider}
                        blurSettings={settings.blurSlider}
                        update={this
                        .inputChangeHandler
                        .bind(this)}
                        typeOptions={settings.typeOptions}
                        fillColorOptions={settings.fillColorOptions}
                        algorithmOptions={settings.algorithmOptions}/>
                    <p>test</p>
                </div>
            </MuiThemeProvider>
        )
    }
};

export default App;
