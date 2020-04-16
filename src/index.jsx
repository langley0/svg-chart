import React from "react";
import ReactDOM from "react-dom";
import "./css/default.css";
import Chart from "./components/Chart";

function createFakeData() {
    // This function creates data that doesn't look entirely random
    const data = []

    for (let x = 0; x <= 300; x++) {
        const random = Math.random();
        const temp = data.length > 0 ? data[data.length-1].y : 50;
        const y = random >= .45 ? temp + Math.floor(random * 20) : temp - Math.floor(random * 20);
        data.push({x: Date.now() + x* 1000,y})
    }
    return data;
}


ReactDOM.render(
    <div className="demo-chart">
        <Chart width={400} height={200} data={createFakeData()} period={20*1000}/>
    </div>,
    document.getElementById("app")
);