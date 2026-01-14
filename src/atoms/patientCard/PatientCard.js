import React from 'react';
import { Link } from "react-router-dom";
import './PatientCard.css';
import { Card, Divider, Tag } from 'antd';
import 'antd/dist/reset.css';
import StatisticRow from '../statisticRow/StatisticRow';

function PatientCard(props) {

  // convert hex color to rgba string for use in box-shadow
  function hexToRgba(hex, alpha = 0.25) {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    let h = hex.replace('#', '');
    if (h.length === 3) {
      h = h.split('').map(c => c + c).join('');
    }
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // compute percent change parts (integer and single-digit decimal) from data array
  function pctParts(arr) {
    const nums = (arr || []).filter(n => n !== null && n !== undefined && !Number.isNaN(n));
    if (nums.length === 0) return { int: 0, dec: 0 };
    const first = nums[0];
    const last = nums[nums.length - 1];
    if (first === 0) {
      if (last === 0) return { int: 0, dec: 0 };
      const val = Math.sign(last) * 100;
      const intPart = Math.trunc(val);
      const decDigit = Math.round(Math.abs(val - intPart) * 10);
      return { int: intPart, dec: decDigit };
    }
    const raw = ((last - first) / first) * 100;
    const roundedOne = Math.round(raw * 10) / 10; // one decimal precision
    const intPart = Math.trunc(roundedOne);
    const decDigit = Math.round(Math.abs(roundedOne - intPart) * 10);
    return { int: intPart, dec: decDigit };
  }

  var pfcolor = "green";
  var picolor = "green";

  if (props.pfTag === "poor"){
    pfcolor = "red"
  }
  else if (props.pfTag === "moderate"){
    pfcolor = "yellow"
  }

  if (props.piTag === "poor"){
    picolor = "red"
  }
  else if (props.piTag === "moderate"){
    picolor = "yellow"
  }


  return (
    <Link to="/patient" onClick={()=> props.setIndex(props.index)}>
        <Card 
            title={props.name} 
            hoverable={true} 
            extra={<span className="dot" style={{backgroundColor: props.dotColor}}></span>} 
            style={{
              width: 320,
              fontWeight: 400,
              borderColor: props.dotColor,
              '--card-shadow': hexToRgba(props.dotColor, 0.28)
            }} 
            className="patient-card">
            {props.metricData.map((data) => {
              const parts = pctParts(data.data);
              return <StatisticRow 
                        metric={data.metric}
                        percentage={parts.int}
                        decimal={parts.dec}
                        arrow={data.arrow}
                        />
            })}
            <Divider/>
            <div className="card-badges">
              <Tag color={pfcolor}>Activeness</Tag>
              <Tag color={picolor}>Pain</Tag>
            </div>
        </Card>
  </Link>
  
      
  );
};

export default PatientCard;