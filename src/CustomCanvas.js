// CustomCanvas
import React, {Component} from 'react';

class CustomCanvas extends Component {
    constructor(props) {
        super(props)
    }
    componentDidMount() {
        this.drawCanvas();
    }
    drawCell(cell, con) {
        if (!cell || !con) 
            return false;
        
        // Draw path
        con.beginPath();
        con.moveTo(cell[0][0], cell[0][1]);
        for (var j = 1, m = cell.length; j < m; ++j) {
            con.lineTo(cell[j][0], cell[j][1]);
            console.log('start rawing!', con)
        }

        // Fill path var color = getColor(cell);
        var color = 'black';
        con.fillStyle = color;
        con.strokeStyle = color;
        con.lineWidth = 1.25;
        con.fill();
        if (con.fillStyle != '#ffffff') {
            con.stroke();
        }
        con.closePath();
        return true;
    }
    drawCanvas() {
        let ctx = this
            .canvas
            .getContext('2d');
        console.log('ctx', ctx)
        for (var i = 0, n = this.props.polygons.length; i < n; ++i) {
            console.log('draw ', this.props.polygons[i])
            this.drawCell(this.props.polygons[i], ctx);
        }
    }
    render() {
        return <canvas
            width={1000}
            height={1000}
            ref={(input) => {
            this.canvas = input;
        }}/>
    }
}

export default CustomCanvas;