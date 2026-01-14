import React from "react";
import Chart from "react-apexcharts";
import './Graph.css';
import 'antd/dist/reset.css';


function Graph(props) {
  
    return (
    <Chart
    options={props.options}
    series={props.series}
    type={props.type}
    className="graph"
    height={400}
    />
    );

}
  
  export default Graph;