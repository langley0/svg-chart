import React from "react";

const LABEL_MARGIN = 4;
const FONT_SIZE = 10;
const GRAPH_MARGIN = 3000;
const GRAPH_Y_MARGIN = 0.1;
const LABEL_HEIGHT = 0;
const LABEL_WIDTH = 0;
const AXIS_MARGIN = 0;


export default class Chart extends React.Component {
    constructor(props) {
        super(props);

        this.update = this.update.bind(this);
        this.state = {
            points: [],
            lastPoint: null,
            minX: 0, 
            maxX: 0,
            minY: 0, 
            maxY: 0,
            graphWidth: 0,
            graphHeight: 0,

        }
    }

    componentDidMount() {
        // 매프레임업데이트를 한다
        this.anim = requestAnimationFrame(this.update);
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.anim)
    }
    
    update() {
        const currentTime = Date.now();
        const { data, period } = this.props;
        const minTime = currentTime - period;
        
        const disappeared = data.find((v, i) => v.x < minTime && data[i+1] && data[i+1].x >= minTime);
        const appeared = data.find(v => v.x > currentTime);
        const pointsInView = data.filter(v=>v.x > minTime && v.x <= currentTime);

        const minX = currentTime - period;
        const maxX = currentTime + GRAPH_MARGIN;
        let lastPoint, minY, maxY;

        // 사라지는 포인트와 마지막 포인트와의 연결점을 찾는다
        if (pointsInView.length > 0) {
            if (disappeared) {
                const x2 = pointsInView[0].x;
                const y2 = pointsInView[0].y;
                const x1 = disappeared.x;
                const y1 = disappeared.y;

                const w = (minTime - x1) / (x2 - x1);
                const x = (x2 - x1) * w + x1;
                const y = (y2 - y1) * w + y1;

                pointsInView.unshift({x, y});
            }

            if (appeared) {
                const x1 = pointsInView[pointsInView.length - 1].x;
                const y1 = pointsInView[pointsInView.length - 1].y;
                const x2 = appeared.x;
                const y2 = appeared.y;

                const w = (currentTime - x1) / (x2 - x1);
                const x = (x2 - x1) * w + x1;
                const y = (y2 - y1) * w + y1;
                
                pointsInView.push({x, y});
            } 
        
            lastPoint = pointsInView[pointsInView.length - 1];
            minY = pointsInView.reduce((min, d) => d.y < min ? d.y : min, pointsInView[0].y);
            maxY = pointsInView.reduce((max, d) => d.y > max ? d.y : max, pointsInView[0].y);

            const margin = (maxY - minY) * GRAPH_Y_MARGIN;
            minY -= margin;
            maxY += margin;
        } else {
            minY = 0;
            maxY = 0;
        }

        this.setState({
            points: pointsInView,
            lastPoint,
            minX, maxX,
            minY, maxY,
        });

        
        // 여기서 중단을 한다
        this.anim = requestAnimationFrame(this.update);
    }

    renderHLine(y) {
        const { width } = this.props;
        const style = {
            strokeWidth: 1,
            stroke: '#333',
        };

        return (
            <g transform={`translate(0, ${y})`}>
                <line x1={-1} x2={width + 1} y1={0} y2={0} style={style}/>
                <text x={-LABEL_MARGIN} y={0} dy={(FONT_SIZE/2 - 2) + "px"} textAnchor={"end"}>{"label"}</text>
            </g>
        );
    }

    renderVLine(x) {
        const { height } = this.props;
        const style = {
            strokeWidth: 1,
            stroke: '#333',
        };

        return (
            <g transform={`translate(${x}, 0)`}>
                <line x1={0} x2={0} y1={-1} y2={height+1} style={style}/>
            </g>
        )
    }

    renderXAxis() {
        const { width, height } = this.props;
        const x1 = AXIS_MARGIN;
        const x2 = width - AXIS_MARGIN - LABEL_WIDTH;
        
        const y1 = height - LABEL_HEIGHT;
        const y2 = y1;

        return (
            <g style={{strokeWidth:2, stroke: "rgb(0, 0, 0)"}} >
                <line x1={x1} x2={x2} y1={y1} y2={y2}/>
            </g>
        );
    }

    renderYAxis() {
        const { width, height } = this.props;
        const x1 = width - LABEL_WIDTH- AXIS_MARGIN;
        const x2 = x1;
        
        const y1 = AXIS_MARGIN;
        const y2 = height - LABEL_HEIGHT;

        return (
            <g  style={{strokeWidth:2, stroke: "rgb(0, 0, 0)"}} >
                <line x1={x1} x2={x2} y1={y1} y2={y2}/>
            </g>
        );
    }
      
    getSvgX(x) {
        const { width } = this.props;
        const { minX, maxX } = this.state;
        if (maxX > minX) {
            return ((x - minX) / (maxX - minX) * width);
        } else {
            return maxX;
        }
    };

    getSvgY(y) {
        const { height } = this.props;
        const { minY, maxY } = this.state;
        if (maxY > minY) {
            return (height - ((y - minY) / (maxY - minY) * height));
        } else {
            return maxY;
        }
    }

    renderGraph() {
        const { points } = this.state;
        if (points.length > 0) {
            let pathD = `M ${this.getSvgX(points[0].x)} ${this.getSvgY(points[0].y)} `;
            for(let i = 1; i < points.length; i++) {
                pathD += ` L ${this.getSvgX(points[i].x)} ${this.getSvgY(points[i].y)}`;
            }

            return (
                <g className="chart-line">
                    <path d={pathD} />
                </g>
            )
        }
    }

    renderPoint() {
        const { points } = this.state;
        if (points.length > 0) {
            const lastPoint = points[points.length - 1];
            return <circle className="chart-lastpoint" cx={this.getSvgX(lastPoint.x)} cy={this.getSvgY(lastPoint.y)} r={4}/>
        } else {
            return null;
        }
    }

    renderValueLine() {
        const { points } = this.state;
        if (points.length > 0) {
            const { width } = this.props;
            const x1 = 0;
            const x2 = width;
            
            const y1 = this.getSvgY(points[points.length - 1].y);
            const y2 = y1;

            return (
                <line className="chart-valueline" x1={x1} x2={x2} y1={y1} y2={y2}/>
            );
        } else {
            return null;
        }

        
    }

    renderTooltip() {
        const { points } = this.state;
        if (points.length > 0) {
            const lastPoint = points[points.length - 1];
            const style = { left: this.getSvgX(lastPoint.x) + 8, top: this.getSvgY(lastPoint.y) - 8};
            return <div className="chart-tooltip" style={style}>{ Number(lastPoint.y).toFixed(1) }</div>
        } else {
            return null;
        }
    }

    render() {
        const { width, height } = this.props;
        return (
            <>
                <div className="chart-title">실시간 차트 데모</div>
                <svg className="chart-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                    { this.renderGraph()}
                    { this.renderPoint()}
                    { this.renderValueLine()}
                </svg>
                { this.renderTooltip() }
            </>
        );
    }
}