import React, { Component } from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ControlPanel from './ControlPanel';
import ControlSettings from './ControlSettings';
import Resampler from './Resampler';
import CustomCanvas from './CustomCanvas';
import Utilities from './Utilities';
import Footer from './Footer';
import RaisedButton from 'material-ui/RaisedButton';
const loadImage = require('../node_modules/blueimp-load-image/js/index.js')

// Comment this in when connected to wifi
// var ReactGA = require('react-ga');

// function logPageView() {
//     ReactGA.set({
//         page: window.location.pathname + window.location.search
//     });
//     ReactGA.pageview(window.location.pathname + window.location.search);
// }

/* Current status:
Tracks 2D context data in source, passes that to putImageData and CustomCanvas via Utilities
However, this doesn't work if you set the image to the screensize (something wrong with
putImageData() implementation). You can't just recompute the dimensions when it's uploaded, 
as these will need to change. 

You need to be able to use the image data *(that is the original size) in:
putImageData (UpdateCanvasCopy)
and in Utilities*/

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
            threshold: 110,
            contrast: 0,
            smoothIters: 0,
            blur: 0,
            srcCanvas: null,
            width: window.innerWidth - 256,
            height: window.innerHeight - 20,
            originalSize: {},
            smoothType: 'laplacian',
            sampler: null,
            polygons: null,
            canvasCopy: null
        }
    }

    componentDidMount() {
        this.uploadFile('./imgs/mountains.png')
    // ReactGA.initialize('UA-49431863-4');
    // logPageView();
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
    downloadCanvas(link, canvasId, filename) {
        let canvas = document.getElementById(canvasId);

        // Convert to blob and download
        canvas.toBlob(function(blob) {
            let url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
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
        let ele = document.getElementById(img.id);
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
        if (!this.refs.canvasCopy || !this.state.srcCanvas) return
        console.log('update canvas copy ', width, height, src)
        this.refs.canvasCopy.width = width;
        this.refs.canvasCopy.height = height;
        let ctx = this.refs.canvasCopy.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        // ctx.putImageData(src, [0, 0], [width, height]);
        ctx.drawImage(src, 0, 0, width, height);
    }
    // Compute dimensions to maximize image size to fit screen
    getDimensions(originalSize) {
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
                console.log('keep height!')
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
        let canvasId = 'customCanvas'
        // Dimensions
        let dims = this.getDimensions();
        let height = dims.height;
        let width = dims.width;

        // Update canvas copy 
        this.updateCanvasCopy(width, height, this.state.srcCanvas)

        // Update re-sampler
        // Issue: currently, updateValues will re-set the sites, as will updateSmoother. This redundancy should be removed
        resampler.updateValues({
            height: height,
            width: width,
            numPoints: this.state.numPoints,
            shape: this.state.shape
        }).updateSmoother({
            smoothType: this.state.smoothType,
            smoothIters: this.state.smoothIters
        })

        // Polygons to draw
        let polygons = this.state.srcCanvas === null ? null : resampler.getPolygons();
        console.log(resampler)
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
                  <div id="title">
                    <h1>Triangulate</h1>
                    <p>Geometric patterns of images</p>
                  </div>
                  <ControlPanel uploadFile={ this.uploadFile.bind(this) } controls={ ControlSettings } status={ this.state } disabled={ !this.state.blackWhite } handleImage={ this
                                                                                                                                                                                   .handleImage
                                                                                                                                                                                   .bind(this) }
                    update={ this
                                 .inputChangeHandler
                                 .bind(this) } />
                </div>
                <div id="originalImage" ref="originalImage" style={ { display: 'none' } } />
                <div id="canvasWrapper">
                  <canvas id="canvasCopy" ref="canvasCopy" />
                  { this.state.srcCanvas !== null &&
                    <CustomCanvas shape={ this.state.shape } canvasId={ canvasId } width={ width } height={ height } utilities={ utilities } polygons={ polygons }
                    /> }
                </div>
              </div>
              { /* figure out a better way to do this: react download file something... */ }
              <a id="download" onClick={ () => this.downloadCanvas(this, canvasId, 'triangle-image.png') }>
                <RaisedButton>Download</RaisedButton>
              </a>
              <Footer />
            </MuiThemeProvider>
        )
    }
}
;

export default App;
