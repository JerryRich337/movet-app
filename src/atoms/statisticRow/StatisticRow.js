import React, { useEffect, useRef, useState } from 'react';
import { Typography, Tooltip} from 'antd';
import { FallOutlined, RiseOutlined, QuestionCircleOutlined, MinusOutlined, HeartOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Title } = Typography;

// Simplified sneaker silhouette (no equivalent icon ships with @ant-design/icons)
const ShoeIcon = (props) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
        <path d="M2 18h20a1 1 0 001-1v-1.5a2 2 0 00-1.4-1.9l-4.6-1.5a3 3 0 01-1.4-1L13 8.6a2 2 0 00-1.8-1H8a2 2 0 00-2 2v1.2a2 2 0 01-.6 1.4L3 14.6A2 2 0 002 16v2z" />
    </svg>
);

// Feather-style crescent moon (no equivalent icon ships with @ant-design/icons)
const HalfMoonIcon = (props) => (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
);

const iconForMetric = (metric) => {
    if (metric === 'Heart Rate') return <HeartOutlined />;
    if (metric === 'Hrs of Rest') return <HalfMoonIcon />;
    return <ShoeIcon />;
};

function StatisticRow(props) {

    const measureRef = useRef(null);
    const [isWrapped, setIsWrapped] = useState(false);

    useEffect(() => {
        const el = measureRef.current;
        if (!el) return undefined;

        const checkWrap = () => {
            const style = window.getComputedStyle(el);
            let lineHeight = parseFloat(style.lineHeight);
            if (Number.isNaN(lineHeight)) {
                lineHeight = parseFloat(style.fontSize) * 1.4;
            }
            setIsWrapped(el.scrollHeight > lineHeight * 1.5);
        };

        checkWrap();
        const observer = new ResizeObserver(checkWrap);
        observer.observe(el);
        return () => observer.disconnect();
    }, [props.metric]);

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
    
    
    const displayValue = props.value !== undefined && props.value !== null && props.value !== ''
        ? props.value
        : `${props.percentage}.${props.decimal}%`;

    return (
    <div className='patient-card-content'>
        <div className='patient-card-value'>
        <span className='patient-card-arrow'>{arrowType}</span>
        <div className='patient-card-percentage'>
                        <Title level={3}>
                            {displayValue}
                            {props.valueSuffix ? <span className="patient-card-value-suffix"> {props.valueSuffix}</span> : null}
                        </Title>
                        {props.trendText ? <Title level={5} style={{fontWeight: 'normal', margin: 0}}>{props.trendText}</Title> : null}
        </div>
        </div>
        <div className='patient-card-metric-info'>
            <div className="patient-card-metric-slot">
                <Title
                    ref={measureRef}
                    aria-hidden="true"
                    style={{color: 'gray', fontWeight: 'normal', marginBottom: 0}}
                    className="patient-card-metric patient-card-metric-measure"
                    level={5}
                >
                    {props.metric}
                </Title>
                {isWrapped ? (
                    <span className="patient-card-metric-icon" role="img" aria-label={props.metric} title={props.metric}>
                        {iconForMetric(props.metric)}
                    </span>
                ) : (
                    <Title style={{color: 'gray', fontWeight: 'normal', marginBottom: 0}} className="patient-card-metric" level={5}>{props.metric}</Title>
                )}
            </div>
            <Tooltip placement="top" title={"lorem ipsum dolor"}><QuestionCircleOutlined /></Tooltip>
        </div>
    </div>
  );
};

export default StatisticRow;