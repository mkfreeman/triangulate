// CustomCanvas
import React, { Component } from 'react';
import ColorUtils from './ColorUtils';

class CustomCanvas extends Component {
    constructor(props) {
        super(props)
    }

    // Draw polygons on update
    updateCanvas() {
        // Reset color utils
        this.colorUtils = ColorUtils()
            .height(this.props.colorSettings.height)
            .width(this.props.colorSettings.width)
            .fillColor(this.props.colorSettings.fillColor)
            .threshold(this.props.colorSettings.threshold)
            .blackWhite(this.props.colorSettings.blackWhite)
            .invert(this.props.colorSettings.invert);

        if (this.props.srcCanvas === null) return;
        console.log(this.props.srcCanvas, this.props.colorSettings.width)
        this.colorUtils.setSrcCanvas(this.props.srcCanvas);

        const ctx = this.refs.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.props.width, this.props.height);

        // draw polygons
        if (this.props.shape !== "circles") {
            this.drawPolygons(ctx);
        } else {
            this.drawCircles(ctx);
        }
    }
    drawPolygons(ctx) {
        for (var i = 0, n = this.props.polygons.length; i < n; ++i) {
            this.drawCell(this.props.polygons[i], ctx);
        }
    }
    // Issue: this.props.polygons doesn't currently have the radius....
    drawCircles(ctx) {
        if (this.props.polygons === null) return;
        for (var i = 0, n = this.props.polygons.length; i < n; ++i) {
            this.drawDot(this.props.polygons[i], this.props.polygons[i].radius, ctx);
        }
    }
    // Function to draw a cell
    drawDot(site, radius, con) {
        var color = this.colorUtils.getDotColor(site, radius);

        con.beginPath();
        con.arc(site[0], site[1], radius, 0, 2 * Math.PI);
        con.closePath();
        con.fillStyle = color;
        con.strokeStyle = color;
        con.lineWidth = 0;
        con.fill();
    }
    componentDidMount() {
        this.updateCanvas();
    }

    componentDidUpdate() {
        this.updateCanvas();
        this.props.onUpdate();
    }
    // Function to draw cell
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
        var color = this.colorUtils.getColor(cell);
        con.strokeStyle = this.props.showLines == true ? 'white' : color;
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
            <canvas id={ this.props.canvasId } ref="canvas" width={ this.props.width } height={ this.props.height } />
            );
    }
}

export default CustomCanvas;