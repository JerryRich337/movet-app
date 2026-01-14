import React from 'react';
import { Typography, Row } from 'antd';
import PatientCard from '../patientCard/PatientCard';
import patientData from '../../data/PatientData';
import 'antd/dist/reset.css';
import '../../App.css'
import './Watchlist.css'

const { Title } = Typography;

function Watchlist(props) {

  var key = 0;

  if (props.metric === "Heart Rate"){
    key = 1;
  }
  else if (props.metric === "Hrs of Rest"){
    key = 2;
  }

  return (
    <div className='watchlist'>
        <Row>
        <Title className="subtitle" level={4}>Watch List</Title>
        </Row>
        <Row className="watchlist-patient-cards">
            {patientData.map((patient) => <PatientCard 
                                                name={patient.name}
                                                metricData={[patient.metricData[key]]}
                                                index={patient.key}
                                                dotColor={patient.dotColor}
                                                setIndex={props.setIndex}
                                                />
            )}
        </Row>
  </div>
  );
};

export default Watchlist;