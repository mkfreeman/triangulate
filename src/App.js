import React, { Component } from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ControlPanel from './ControlPanel';
import ControlSettings from './ControlSettings';
import Resampler from './Resampler';
import CustomCanvas from './CustomCanvas';
import Footer from './Footer';
import RaisedButton from 'material-ui/RaisedButton';
const loadImage = require('../node_modules/blueimp-load-image/js/index.js')

// Track page views
var ReactGA = require('react-ga');
ReactGA.initialize('UA-49431863-4');

function logPageView() {
    ReactGA.set({
        page: window.location.pathname + window.location.search
    });
    ReactGA.pageview(window.location.pathname + window.location.search);
}

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
            contrastIters: 0,
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
        logPageView();
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
    setDownloadBlob(linkId, canvasId, filename) {
        let canvas = document.getElementById(canvasId);
        let link = document.getElementById(linkId);

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
        if (this.state.fitToScreen === true) {
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
        let canvasId = 'customCanvas'
        // Dimensions
        let dims = this.getDimensions();
        let height = dims.height;
        let width = dims.width;

        // Update canvas copy 
        this.updateCanvasCopy(width, height, this.state.srcCanvas)

        // Update re-sampler        
        resampler.updateValues({
            height: height,
            width: width,
            numPoints: this.state.numPoints,
            shape: this.state.shape,
            numResample: this.state.contrastIters
        }).updateSmoother({
            smoothType: this.state.smoothType,
            smoothIters: this.state.smoothIters,
            contrastIters: this.state.contrastIters
        }).setSrcCanvas(this.state.srcCanvas);
        // Get polygons from resampler
        let polygons = this.state.srcCanvas === null ? null : resampler.getPolygons();

        // Pass color utilities options
        let colorSettings = {
            height: height,
            width: width,
            threshold: this.state.threshold,
            fillColor: this.state.fillColor,
            blackWhite: this.state.blackWhite,
            invert: this.state.invert
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
                    <CustomCanvas showLines={ this.state.showLines } srcCanvas={ this.refs.canvasCopy } colorSettings={ colorSettings } onUpdate={ () => this.setDownloadBlob("download", canvasId, "triangle-image.png") } shape={ this.state.shape }
                      canvasId={ canvasId } width={ width } height={ height } polygons={ polygons } /> }
                </div>
                { /* figure out a better way to do this: react download file something... */ }
                <a id="download" download>
                  <RaisedButton>Download</RaisedButton>
                </a>
                <Footer />
              </div>
            </MuiThemeProvider>
        )
    }
}
;

export default App;
