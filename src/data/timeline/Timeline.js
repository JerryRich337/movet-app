import React from 'react';
import './Timeline.css';
import { Typography, Row, Col, Badge, Card } from 'antd';
import 'antd/dist/reset.css';
import PatientCard from '../../atoms/patientCard/PatientCard';

const { Title } = Typography;

function Timeline(props) {
  const athletes = props.athletes || [];
  
  const weeks0_3 = athletes.filter(p => p.currentWeek >= 0 && p.currentWeek <= 3);
  const weeks4_6 = athletes.filter(p => p.currentWeek >= 4 && p.currentWeek <= 6);
  const weeks7_9 = athletes.filter(p => p.currentWeek >= 7 && p.currentWeek <= 9);
  const weeks10Plus = athletes.filter(p => p.currentWeek >= 10);

  return (
      <Row className='timeline'>
        <Col className="weeks-group">
            <div className='weeks-group-header'>
                <Title level={4}>Events 0-3</Title>
                <Badge count={weeks0_3.length} color='#E53935' />
            </div>
            <Card className='weeks-group-content' bodyStyle={{padding: "4px"}}>
                {weeks0_3.map(p => (
                  <PatientCard key={p.id || p.key} className="weeks-group-card"
                    athlete={p}
                    name={p.name}
                    metricData={p.metricData}
                    dotColor={p.dotColor}
                    index={p.key}
                    setIndex={props.setIndex}
                    pfTag={p.pfTags && p.pfTags[0]}
                    piTag={p.piTags && p.piTags[0]}
                    onEdit={props.onEdit}
                    onDelete={props.onDelete} />
                ))}
            </Card>
        </Col>
        <Col className="weeks-group">
            <div className='weeks-group-header'>
                <Title level={4}>Events 4-6</Title>
                <Badge count={weeks4_6.length} color='#E53935' />
            </div>
            <Card className='weeks-group-content' bodyStyle={{padding: "4px"}}>
                {weeks4_6.map(p => (
                  <PatientCard key={p.id || p.key} className="weeks-group-card"
                    athlete={p}
                    name={p.name}
                    metricData={p.metricData}
                    dotColor={p.dotColor}
                    index={p.key}
                    setIndex={props.setIndex}
                    pfTag={p.pfTags && p.pfTags[0]}
                    piTag={p.piTags && p.piTags[0]}
                    onEdit={props.onEdit}
                    onDelete={props.onDelete} />
                ))}
            </Card>
        </Col>
        <Col className="weeks-group">
            <div className='weeks-group-header'>
                <Title level={4}>Events 6-9</Title>
                <Badge count={weeks7_9.length} color='#E53935' />
            </div>
            <Card className='weeks-group-content' bodyStyle={{padding: "4px"}}>
                {weeks7_9.map(p => (
                  <PatientCard key={p.id || p.key} className="weeks-group-card"
                    athlete={p}
                    name={p.name}
                    metricData={p.metricData}
                    dotColor={p.dotColor}
                    index={p.key}
                    setIndex={props.setIndex}
                    pfTag={p.pfTags && p.pfTags[0]}
                    piTag={p.piTags && p.piTags[0]}
                    onEdit={props.onEdit}
                    onDelete={props.onDelete} />
                ))}
            </Card>
        </Col>
        <Col className="weeks-group">
            <div className='weeks-group-header events-10plus'>
                <Title level={4}>Events 10+</Title>
                <Badge count={weeks10Plus.length} color='#E53935' />
            </div>
            <Card className='weeks-group-content' bodyStyle={{padding: "4px"}}>
                {weeks10Plus.map(p => (
                  <PatientCard key={p.id || p.key} className="weeks-group-card"
                    athlete={p}
                    name={p.name}
                    metricData={p.metricData}
                    dotColor={p.dotColor}
                    index={p.key}
                    setIndex={props.setIndex}
                    pfTag={p.pfTags && p.pfTags[0]}
                    piTag={p.piTags && p.piTags[0]}
                    onEdit={props.onEdit}
                    onDelete={props.onDelete} />
                ))}
            </Card>
        </Col>
      </Row>
  );
};

export default Timeline;