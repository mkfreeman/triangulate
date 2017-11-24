import React, { Component } from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ControlPanel from './ControlPanel';
import ControlSettings from './ControlSettings';
import Resampler from './Resampler';
import CustomCanvas from './CustomCanvas';
import Utilities from './Utilities';
const loadImage = require('../node_modules/blueimp-load-image/js/index.js')

const utilities = new Utilities();
const resampler = new Resampler();
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numPoints: 5000,
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
            width: window.innerWidth - 600,
            height: window.innerHeight,
            originalSize: {},
            sampler: null,
            polygons: null,
            canvasCopy: null
        }
    }

    componentDidMount() {
        this.uploadFile('./imgs/mountains.png')
    }

    uploadFile(file) {
        loadImage(file, function(img) {
            img.id = "rawCanvas";
            img.className += "hero";
            this
                .handleImage(img)
        }.bind(this), {
            canvas: true,
            orientation: true
        });
    }

    inputChangeHandler(event, id, newValue) {
        let obj = {};
        obj[id] = newValue;
        this.setState(obj);
    }
    handleImage(img, size) {
        // Remove child element assuming elm is the element
        while (this.refs.originalImage.firstChild) {
            this.refs.originalImage
                .removeChild(this.refs.originalImage.firstChild);
        }
        this.refs.originalImage
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
    updateCanvasCopy(width, height, src) {
        // console.log('update canvas copy ')
        if (!this.refs.canvasCopy || !this.state.srcCanvas) return
        this.refs.canvasCopy.width = width;
        this.refs.canvasCopy.height = height;
        let ctx = this.refs.canvasCopy.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(src, 0, 0, width, height);
    }
    getDimensions() {
        let width = null,
            height = null;
        if (this.state.fitToScreen == true) {
            // Maximize area of photo
            let imageRatio = this.state.originalSize.width / this.state.originalSize.height;
            let screenRatio = this.state.width / this.state.height;
            let scale = Math.min(this.state.width / this.state.originalSize.width, this.state.height / this.state.originalSize.height);
            if (imageRatio > screenRatio) {
                width = Math.floor(this.state.width);
                height = Math.floor(this.state.originalSize.height * scale);
            } else {
                height = Math.floor(this.state.height);
                width = Math.floor(this.state.originalSize.width * scale);
            }
        } else {
            height = this.state.originalSize.height;
            width = this.state.originalSize.width;
        }
        return {
            width: width,
            height: height
        }
    }

    render() {

        // Dimensions
        let dims = this.getDimensions();
        let height = dims.height;
        let width = dims.width;

        // Update canvas copy 
        this.updateCanvasCopy(width, height, this.state.srcCanvas)
        resampler.updateValues({
            height: height,
            width: width,
            numPoints: this.state.numPoints
        })

        let polygons = resampler.voronoi == null ? null :
            resampler.voronoi(resampler.sites)
                .polygons();

        // Set utilities options
        utilities.setOptions(this.state)
        utilities.setOptions({
            height: height,
            width: width
        })
        if (this.state.srcCanvas) {
            utilities.setSrcCanvas(this.refs.canvasCopy)
        }
        return (
            <MuiThemeProvider>
              <div>
                <div>
                  <ControlPanel uploadFile={ this.uploadFile.bind(this) } controls={ ControlSettings } status={ this.state } disabled={ !this.state.blackWhite } handleImage={ this
                                                                                                                                                                                   .handleImage
                                                                                                                                                                                   .bind(this) }
                    update={ this
                                 .inputChangeHandler
                                 .bind(this) } />
                </div>
                <div id="originalImage" ref="originalImage" style={ { display: 'none' } } />
                <canvas id="canvasCopy" ref="canvasCopy" style={ { marginLeft: '300px' } } />
                { this.state.srcCanvas !== null &&
                  <CustomCanvas width={ width } height={ height } utilities={ utilities } polygons={ polygons } /> }
              </div>
            </MuiThemeProvider>
        )
    }
}
;

export default App;
