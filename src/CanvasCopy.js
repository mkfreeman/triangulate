// Canvas copy (redraw img at different width/height)
import React, { Component } from 'react';

class CanvasCopy extends Component {
    componentDidUpdate() {
        this.update();
    }
    componentDidMount() {
        this.update();
    }
    update() {
        let ctx = this.refs.canvas.getContext('2d');
        console.log(this.props.srcCanvas)
        if (this.props.srcCanvas) ctx.drawImage(this.props.srcCanvas, 0, 0, this.props.width, this.props.height);
    }
    render() {
        return <canvas ref="canvas" width={ this.props.width } height={ this.props.height } style={ { marginLeft: '300px' } } />
    }
}
export default CanvasCopy;