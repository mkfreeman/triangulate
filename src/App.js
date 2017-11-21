import React, {Component} from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ControlPanel from './ControlPanel';
import ControlSettings from './ControlSettings';
import Resampler from './Resampler';
import CustomCanvas from './CustomCanvas';

const sampler = new Resampler(100, 100)
    .setVoronoi()
    .getSites();

const polygons = sampler
    .voronoi(sampler.sites)
    .polygons();;
console.log('polygons!', polygons)
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numPoints: 1000,
            shape: 'triangles',
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
        this.setState({originalSize: originalSize});
    }
    render() {
        return (
            <MuiThemeProvider>
                <div>
                    <div>
                        <ControlPanel
                            controls={ControlSettings}
                            status={this.state}
                            disabled={!this.state.blackWhite}
                            handleImage={this
                            .handleImage
                            .bind(this)}
                            update={this
                            .inputChangeHandler
                            .bind(this)}/>
                    </div>
                    {/* original image */}
                    <div
                        id="originalImage"
                        ref={(input) => {
                        this.textInput = input;
                    }}/>
                    <CustomCanvas polygons={polygons}/>
                </div>
            </MuiThemeProvider>
        )
    }
};

export default App;
