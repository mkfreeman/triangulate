// CustomCanvas
import React, { Component } from 'react';

class CustomCanvas extends Component {
    constructor(props) {
        super(props)
    }

    updateCanvas() {
        const ctx = this.refs.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.props.width, this.props.height);

        for (var i = 0, n = this.props.polygons.length; i < n; ++i) {
            this.drawCell(this.props.polygons[i], ctx);
        }
    }

    componentDidMount() {
        this.updateCanvas();
    }

    componentDidUpdate() {
        console.log('update customcanvas')
        this.updateCanvas();
    }
    drawCell(cell, con) {
        if (!cell || !con)
            return false;

        // Draw path
        con.beginPath();
        con.moveTo(cell[0][0], cell[0][1]);
        for (var j = 1, m = cell.length; j < m; ++j) {
            con.lineTo(cell[j][0], cell[j][1]);
        }

        // Fill path var color = getColor(cell);
        var color = this.props.utilities.getColor(cell);
        con.strokeStyle = this.props.utilities.showLines == true ? 'black' : color;
        con.fillStyle = color;
        con.lineWidth = 0;
        con.fill();
        if (con.fillStyle != '#ffffff') {
            con.stroke();
        }
        con.closePath();
        return true;
    }
    render() {
        return (
            <canvas ref="canvas" width={ this.props.width } height={ this.props.height } style={ { marginLeft: "300px" } } />
            );
    }
}

export default CustomCanvas;