// ControlPanel
import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import Slider from 'material-ui/Slider';
import Checkbox from 'material-ui/Checkbox'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Toggle from 'material-ui/Toggle';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import './ControlPanel.css';

class ControlPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: true,
            modalOpen: false,
            styles: {
                slider: {
                    marginTop: '0px',
                    marginBottom: '20px'
                },
                radioGroup: {
                    marginTop: '10px',
                    marginBottom: '10px'
                },
                select: {
                    marginTop: '0px',
                    width: "100%"
                },
                drawer: {
                    marginTop: this.props.mobile === true ? '64px' : '0px',
                    opacity: this.props.mobile === true ? 0.7 : 1
                },
                overlay: {
                    opacity: '0',
                    backgroundColor: 'none'
                }
            }
        }
    }

    handleOpen() {
        let open = this.state.open === true ?
            false :
            true;
        this.setState({
            open: open
        });
    }

    handleModal() {
        let open = this.state.modalOpen === true
            ? false
            : true;
        this.setState({
            modalOpen: open
        })

    }

    // Handle slider change
    handleSliderChange(key, val) {
        let obj = {}
        obj[key] = val;
        this.setState(obj);
    }
    render() {
        //console.log(this.props.disabled)
        return (
            <div>
              { this.props.mobile && <AppBar title="Triangulate" onLeftIconButtonTouchTap={ () => this.handleOpen() } iconClassNameRight="muidocs-icon-navigation-expand-more" /> }
              <Drawer overlayStyle={ this.state.styles.overlay } docked={ !this.props.mobile } open={ this.state.open } onRequestChange={ (open) => this.setState({
                                                                                                                                              open
                                                                                                                                          }) } containerStyle={ this.state.styles.drawer }>
                <div className="controlWrapper">
                  <div id="uploadWrapper">
                    <RaisedButton primary={ true } containerElement='label' label='Upload File'>
                      <input onChange={ (e) => this.props.uploadFile(e.target.files[0]) } type="file" style={ { display: 'none' } } />
                    </RaisedButton>
                  </div>
                  { this
                        .props
                        .controls
                        .map(function(control) {
                            let ele;
                            switch (control.type) {
                                case 'select':
                                    ele = <SelectField key={ control.id } floatingLabelText={ control.label } value={ this.props.status[control.id] } style={ this.state.styles.select } onChange={ (e, key, val) => this.props.update(e, control.id, val) }>
                                            { control
                                                  .options
                                                  .map(function(d) {
                                                      return (<MenuItem key={ control.id + '-' + d.id } value={ d.id } primaryText={ d.label } />)
                                                  }) }
                                          </SelectField>
                                    break;
                                case 'header':
                                    ele = <div key={ control.id }>
                                            <h3>{ control.label }</h3>
                                            <hr/>
                                          </div>
                                    break;
                                case 'slider':
                                    if (control.id === "circleSpacing") {
                                        //console.log(this.props.disabled[control.id], control.id)
                                    }
                                    ele = <div key={ control.id } className="sliderWrapper">
                                            { (control.getDisabled === undefined || (control.getDisabled !== undefined && !control.getDisabled(this.props.disabled[control.id]))) &&
                                              <div>
                                                <label>
                                                  { control.getLabel(this.props.status[control.id]) }
                                                </label>
                                                <Slider id={ control.id } min={ control.min } max={ control.max } step={ control.step } onChange={ (e, val) => this.handleSliderChange(control.id, val) } onDragStop={ (e) => this.props.update(e, control.id, this.state[control.id]) }
                                                  defaultValue={ this.props.status[control.id] } sliderStyle={ this.state.styles.slider } />
                                              </div> }
                                          </div>
                                    break;
                                case 'checkbox':
                                    ele = <div key={ control.id }>
                                            { (control.getDisabled === undefined || (control.getDisabled !== undefined && !control.getDisabled(this.props.disabled[control.id]))) &&
                                              <Checkbox checked={ this.props.status[control.id] } label={ control.label } onCheck={ (e, val) => this.props.update(e, control.id, val) } /> }
                                          </div>
                                    break;
                                case 'radio':
                                    ele = <RadioButtonGroup key={ control.id } onChange={ (e, val) => this.props.update(e, control.id, val) } name={ control.id } defaultSelected={ this.props.status[control.id] } style={ this.state.styles.radioGroup }>
                                            { control
                                                  .options
                                                  .map(function(d) {
                                                      return (<RadioButton key={ control.id + "-" + d.id } value={ d.id } label={ d.label } />)
                                                  }) }
                                          </RadioButtonGroup>
                                    break;
                                case 'toggle':
                                    ele = <div key={ control.id }>
                                            { (control.getDisabled === undefined || (control.getDisabled !== undefined && !control.getDisabled(this.props.disabled[control.id]))) &&
                                              <Toggle label={ control.label } style={ this.state.styles.toggle } toggled={ this.props.status[control.id] } onToggle={ (e, val) => this.props.update(e, control.id, val) } /> }
                                          </div>
                                    break;
                                default:
                                    ele = <div key={ control.id }></div>
                            }
                            return ele;
                        }.bind(this)) }
                  <RaisedButton label="About" onClick={ this
                                                            .handleModal
                                                            .bind(this) } />
                  <Dialog title="About" modal={ false } open={ this.state.modalOpen } onRequestClose={ this
                                                                                                           .handleModal
                                                                                                           .bind(this) }>
                    <p>This project uses a
                      { ' ' }
                      <a href="https://github.com/d3/d3/blob/master/API.md#voronoi-diagrams-d3-voronoi" target="_blank" rel="noopener noreferrer">Voronoi Diagram</a> to randomly
                      sample points from an image to construct an abstracted representation of it. It was built based on
                      { ' ' }
                      <a href="https://bl.ocks.org/mbostock/4341156" rel="noopener noreferrer">this example</a>  that expresses the Delaunay Triangulation used to compute a
                      Voronoi Diagram. See
                      { ' ' }
                      <a href="https://github.com/mkfreeman/triangulate" target="_blank" rel="noopener noreferrer">code</a>  on GitHub.</p>
                    Hexagon, circle, and smoothing functionality built by
                    { ' ' }
                    <a href="https://scholar.google.com/citations?user=247cncgAAAAJ" target="_blank" rel="noopener noreferrer">Alex Rand</a>.
                  </Dialog>
                </div>
              </Drawer>
            </div>
        )
    }
}
export default ControlPanel;