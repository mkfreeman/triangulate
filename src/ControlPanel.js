// ControlPanel
import React, {Component} from 'react';
import Drawer from 'material-ui/Drawer';
import Slider from 'material-ui/Slider';
import Checkbox from 'material-ui/Checkbox'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Toggle from 'material-ui/Toggle';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';

let styles = {
    slider: {
        marginTop: '0px'
    }
};

class ControlPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: true,
            modalOpen: false
        }
    }
    handleModal() {
        let open = this.state.modalOpen == true
            ? false
            : true;
        this.setState({modalOpen: open})

    }
    // handleModalClose() {     this.setState({modalOpen: value}) }
    render() {
        console.log(this.props.thresholdSettings)
        return (
            <div>
                <Drawer open={this.state.open}>
                    <h3>Image Options</h3>
                    <hr/>
                    <SelectField
                        floatingLabelText="Select Shape"
                        value={this.props.type}
                        style={{
                        width: "100%"
                    }}
                        onChange={(e, key, val) => this.props.update(e, "type", val)}>
                        {this
                            .props
                            .typeOptions
                            .map(function (d) {
                                return (<MenuItem key={"type-" + d.id} value={d.id} primaryText={d.label}/>)
                            })}
                    </SelectField>
                    <label># of Points: {this.props.numPoints}</label>
                    <Slider
                        id="numPoints"
                        min={this.props.numPointsSettings.min}
                        max={this.props.numPointsSettings.max}
                        step={this.props.numPointsSettings.step}
                        onChange={(e, val) => this.props.update(e, "numPoints", val)}
                        defaultValue={this.props.numPoints}
                        sliderStyle={styles.slider}/>
                    <Checkbox
                        checked={this.props.fitToScreen}
                        label="Fit Image To Screen"
                        onCheck={(e, val) => this.props.update(e, "fitToScreen", val)}/>
                    <Checkbox
                        checked={this.props.showLines}
                        label="Show Polygon Outlines"
                        onCheck={(e, val) => this.props.update(e, "showLines", val)}/>
                    <label>Blend Original Image: {this.props.blend}%</label>
                    <Slider
                        min={this.props.blendSettings.min}
                        max={this.props.blendSettings.max}
                        step={this.props.blendSettings.step}
                        onChange={(e, val) => this.props.update(e, "blend", val)}
                        defaultValue={this.props.blend}
                        sliderStyle={styles.slider}/>
                    <h3>Color Options</h3>
                    <hr/>
                    <RadioButtonGroup name="fillColor" defaultSelected={this.props.fillColor}>
                        {this
                            .props
                            .fillColorOptions
                            .map(function (d) {
                                return (<RadioButton key={"color-" + d.id} value={d.id} label={d.label}/>)
                            })}
                    </RadioButtonGroup>
                    <Toggle
                        label="Black and White"
                        style={styles.toggle}
                        toggled={this.props.blackWhite}
                        onToggle={(e, val) => this.props.update(e, "blackWhite", val)}/>
                    <Toggle
                        label="Invert Black and White"
                        style={styles.toggle}
                        toggled={this.props.invert}
                        disabled={!this.props.blackWhite}
                        onToggle={(e, val) => this.props.update(e, "invert", val)}/>
                    <label>Black/White Threshold: {this.props.threshold}</label>
                    <Slider
                        min={this.props.thresholdSettings.min}
                        max={this.props.thresholdSettings.max}
                        step={this.props.thresholdSettings.step}
                        onChange={(e, val) => this.props.update(e, "threshold", val)}
                        defaultValue={this.props.threshold}
                        disabled={!this.props.blackWhite}
                        sliderStyle={styles.slider}/>
                    <h3>Smoothing Options</h3>
                    <hr/>
                    <label>Resample for Contrast: {this.props.contrast}
                        &nbsp;times</label>
                    <Slider
                        min={this.props.contrastSettings.min}
                        max={this.props.contrastSettings.max}
                        step={this.props.contrastSettings.step}
                        onChange={(e, val) => this.props.update(e, "contrast", val)}
                        defaultValue={this.props.contrast}
                        sliderStyle={styles.slider}/>
                    <label>Resample to Distribute Points: {this.props.distribute}
                        &nbsp;times</label>
                    <Slider
                        min={this.props.distributeSettings.min}
                        max={this.props.distributeSettings.max}
                        step={this.props.distributeSettings.step}
                        onChange={(e, val) => this.props.update(e, "distribute", val)}
                        defaultValue={this.props.distribute}
                        sliderStyle={styles.slider}/>
                    <SelectField
                        floatingLabelText="Smoothing Algorithm"
                        value={this.props.algorithm}
                        style={{
                        width: "100%"
                    }}
                        onChange={(e, key, val) => this.props.update(e, "algorithm", val)}>
                        {this
                            .props
                            .algorithmOptions
                            .map(function (d) {
                                return (<MenuItem key={"algorithm-" + d.id} value={d.id} primaryText={d.label}/>)
                            })}
                    </SelectField>
                    <label>Blur Original Image: {this.props.blur}
                        %</label>
                    <Slider
                        min={this.props.blurSettings.min}
                        max={this.props.blurSettings.max}
                        step={this.props.blurSettings.step}
                        onChange={(e, val) => this.props.update(e, "blur", val)}
                        defaultValue={this.props.blur}
                        sliderStyle={styles.slider}/>
                    <RaisedButton
                        label="About"
                        onClick={this
                        .handleModal
                        .bind(this)}/>
                    <Dialog
                        title="About"
                        modal={false}
                        open={this.state.modalOpen}
                        onRequestClose={this
                        .handleModal
                        .bind(this)}>
                        <p>This project uses a &nbsp;
                            <a
                                href="https://github.com/d3/d3/blob/master/API.md#voronoi-diagrams-d3-voronoi"
                                target="_blank">Voronoi Diagram</a>&nbsp;
                            to randomly sample points from an image to construct an abstracted
                            representation of it. It was built based on&nbsp;
                            <a href="https://bl.ocks.org/mbostock/4341156">this example</a>&nbsp; that
                            expresses the Delaunay Triangulation used to compute a Voronoi Diagram.
                            See&nbsp;
                            <a href="https://github.com/mkfreeman/triangulate" target="_blank">code</a>&nbsp; on GitHub.</p>
                        Hexagon, circle, and smoothing functionality built by&nbsp;
                        <a
                            href="https://scholar.google.com/citations?user=247cncgAAAAJ"
                            target="_blank">Alex Rand</a>.
                    </Dialog>
                </Drawer>
            </div>
        )
    }
}
export default ControlPanel;