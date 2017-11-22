import React, { Component } from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ControlPanel from './ControlPanel';
import ControlSettings from './ControlSettings';
import Resampler from './Resampler';
import CustomCanvas from './CustomCanvas';
import Utilities from './Utilities';

const utilities = new Utilities();
const resampler = new Resampler();
console.log('resampler', resampler)
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numPoints: 1000,
            shape: 'triangles',
            fitToScreen: true,
            showLines: false,
            blend: 50,
            fillColor: "average",
            blackWhite: false,
            invert: false,
            threshold: 178,
            contrast: 0,
            distribute: 0,
            algorithm: 'lloyd',
            blur: 0,
            srcCanvas: null,
            width: window.innerWidth - 300,
            height: window.innerHeight,
            originalSize: {},
            sampler: null,
            polygons: null
        }
    }
    inputChangeHandler(event, id, newValue) {
        let obj = {};
        obj[id] = newValue;
        this.setState(obj);
    }
    handleImage(img, size) {
        // Remove child element assuming elm is the element
        while (this.textInput.firstChild) {
            this
                .textInput
                .removeChild(this.textInput.firstChild);
        }
        this
            .textInput
            .appendChild(img);

        // Store original size
        let ele = document.getElementById(img.id)
        let originalSize = {
            width: ele.width,
            height: ele.height
        };
        this.setState({
            originalSize: originalSize,
            srcCanvas: ele
        });
    }
    // componentDidMount() {
    //     resampler.setVoronoi()
    //         .getSites();
    // }

    render() {
        // Compute utilites to pass to CustomCanvas
        // Redefine these (as a component?) so it only updates when inputs update

        // let sampler = new resampler(this.state.originalSize.width, this.state.originalSize.height, this.state.numPoints)
        //     .setVoronoi()
        //     .getSites();

        // Redefine these (as a component?) so it only updates when inputs update

        resampler.updateValue('height', this.state.originalSize.height)
            .updateValue('width', this.state.width)
            .updateValue('numPoints', this.state.numPoints);

        let polygons = resampler.voronoi == null ? null :
            resampler.voronoi(resampler.sites)
                .polygons();

        // Set utilities options
        utilities.setOptions(this.state)
        if (this.state.srcCanvas) utilities.setSrcCanvas(this.state.srcCanvas)
        return (
            <MuiThemeProvider>
              <div>
                <div>
                  <ControlPanel controls={ ControlSettings } status={ this.state } disabled={ !this.state.blackWhite } handleImage={ this
                                                                                                                                         .handleImage
                                                                                                                                         .bind(this) } update={ this
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    .inputChangeHandler
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    .bind(this) }
                  />
                </div>
                <div id="originalImage" ref={ (input) => {
                                                  this.textInput = input;
                                              } } />
                { this.state.srcCanvas !== null &&
                  <CustomCanvas width={ this.state.originalSize.width } height={ this.state.originalSize.height } utilities={ utilities } polygons={ polygons } /> }
              </div>
            </MuiThemeProvider>
        )
    }
}
;

export default App;
