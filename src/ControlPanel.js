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
import './ControlPanel.css';
let styles = {
    slider: {
        marginTop: '0px',
        marginBottom: '20px'
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
        let open = this.state.modalOpen === true
            ? false
            : true;
        this.setState({
            modalOpen: open
        })

    }

    // handleModalClose() {     this.setState({modalOpen: value}) }
    render() {
        return (
            <div>
              <Drawer open={ this.state.open } style={ styles.drawer }>
                <div className="controlWrapper">
                  <RaisedButton containerElement='label' label='Upload File'>
                    <input onChange={ (e) => this.props.uploadFile(e.target.files[0]) } type="file" style={ { display: 'none' } } />
                  </RaisedButton>
                  { this
                        .props
                        .controls
                        .map(function(control) {
                            switch (control.type) {
                                case 'select':
                                    return <SelectField key={ control.id } floatingLabelText={ control.label } value={ this.props.status[control.id] } style={ { width: "100%" } } onChange={ (e, key, val) => this.props.update(e, control.id, val) }>
                                             { control
                                                   .options
                                                   .map(function(d) {
                                                       return (<MenuItem key={ control.id + '-' + d.id } value={ d.id } primaryText={ d.label } />)
                                                   }) }
                                           </SelectField>
                                    break;
                                case 'header':
                                    return <div>
                                             <h3>{ control.label }</h3>
                                             <hr/>
                                           </div>
                                    break;
                                case 'slider':
                                    return <div className="sliderWrapper">
                                             <label>
                                               { control.getLabel(this.props.status[control.id]) }
                                             </label>
                                             <Slider key={ control.id } id={ control.id } min={ control.min } max={ control.max } step={ control.step } disabled={ control.getDisabled === undefined
                                                                                                                                                                   ? false
                                                                                                                                                                   : control.getDisabled(this.props.disabled) }
                                               onChange={ (e, val) => this.props.update(e, control.id, val) } defaultValue={ this.props.status[control.id] } sliderStyle={ styles.slider } />
                                           </div>
                                    break;
                                case 'checkbox':
                                    return <Checkbox key={ control.id } checked={ this.props.status[control.id] } label={ control.label } onCheck={ (e, val) => this.props.update(e, control.id, val) } />
                                    break;
                                case 'radio':
                                    return <RadioButtonGroup key={ control.id } name={ control.id } defaultSelected={ this.props.status[control.id] }>
                                             { control
                                                   .options
                                                   .map(function(d) {
                                                       return (<RadioButton key={ control.id + "-" + d.id } value={ d.id } label={ d.label } />)
                                                   }) }
                                           </RadioButtonGroup>
                                    break;
                                case 'toggle':
                                    return <Toggle key={ control.id } label={ control.label } style={ styles.toggle } toggled={ this.props.status[control.id] } disabled={ control.getDisabled === undefined
                                                                                                                                                    ? false
                                                                                                                                                    : control.getDisabled(this.props.disabled) } onToggle={ (e, val) => this.props.update(e, control.id, val) }
                                           />
                            }
                        }.bind(this)) }
                  <RaisedButton label="About" onClick={ this
                                                            .handleModal
                                                            .bind(this) } />
                  <Dialog title="About" modal={ false } open={ this.state.modalOpen } onRequestClose={ this
                                                                                                           .handleModal
                                                                                                           .bind(this) }>
                    <p>This project uses a
                      <a href="https://github.com/d3/d3/blob/master/API.md#voronoi-diagrams-d3-voronoi" target="_blank">Voronoi Diagram</a>  to randomly sample points from an
                      image to construct an abstracted representation of it. It was built based on
                      <a href="https://bl.ocks.org/mbostock/4341156">this example</a>  that expresses the Delaunay Triangulation used to compute a Voronoi Diagram. See
                      <a href="https://github.com/mkfreeman/triangulate" target="_blank">code</a>  on GitHub.</p>
                    Hexagon, circle, and smoothing functionality built by
                    <a href="https://scholar.google.com/citations?user=247cncgAAAAJ" target="_blank">Alex Rand</a>.
                  </Dialog>
                </div>
              </Drawer>
            </div>
        )
    }
}
export default ControlPanel;