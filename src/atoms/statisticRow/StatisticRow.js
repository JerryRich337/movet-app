import React from 'react';
import { Typography, Tooltip} from 'antd';
import { FallOutlined, RiseOutlined, QuestionCircleOutlined, MinusOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Title } = Typography;

function StatisticRow(props) {

    // mid is minus
    var arrowType = <MinusOutlined style={{fontSize: 30, color: "gray"}}/>

    if (props.arrow === "down") {
        
        // decrease in heart rate is good --> green
        if (props.metric === "Heart Rate"){
            arrowType = <FallOutlined style={{fontSize: 30, color: "#52c41a"}}/>
        }
        // decrease in steps or hours of sleep is bad --> red
        else {
            arrowType = <FallOutlined style={{fontSize: 30, color: "#f37f89"}}/>
        }

        
    }
    else if (props.arrow === "up"){
       
        // increase in heart rate is bad --> red
        if (props.metric === "Heart Rate"){
            arrowType = <RiseOutlined style={{fontSize: 30, color: "#f37f89"}}/>
        }
        // increase in steps or hours of sleep is good --> green
        else {
            arrowType = <RiseOutlined style={{fontSize: 30, color: "#52c41a"}}/>
        }
    } 
    
    
  return (
    <div className='patient-card-content'>
        <div className='patient-card-value'>
        <span className='patient-card-arrow'>{arrowType}</span>
        <div className='patient-card-percentage'>
            <Title level={3}>{props.percentage}</Title>
            <Title level={4}>.{props.decimal}%</Title>
        </div>
        </div>
        <div className='patient-card-metric-info'>
            <Title style={{color: 'gray', fontWeight: 'normal', marginBottom: 0}} className="patient-card-metric" level={5}>{props.metric}</Title>
            <Tooltip placement="top" title={"lorem ipsum dolor"}><QuestionCircleOutlined /></Tooltip>
        </div>
    </div>
  );
};

export default StatisticRow;