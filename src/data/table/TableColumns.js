import React from 'react';
import { Tag } from 'antd';
import { Link } from "react-router-dom";
import patientData from '../PatientData';

const tableColumns = (setIndex) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: {
      compare: (a, b) => a.name <= b.name,
      multiple: 3,
    },
    // filters: [
    //   { text: 'Male', value: 'male' },
    //   { text: 'Female', value: 'female' },
    // ],
    // onClick={()=> props.setIndex(props.index)}
    // render: (name) => <Link to="/patient" >{name}</Link>,
    render: (_, { name }) => (
      <>
        {patientData.map((patient) => {
          let index = 0;
          if (patient.name === name) {
            index = patient.key;
            return (
              <Link to="/patient" onClick={()=> setIndex(index)}>{name}</Link>
            );
          }
        })}
      </>
    ),
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    sorter: {
      compare: (a, b) => a.age - b.age,
      multiple: 3,
    },
  },
  {
    title: 'Step Count',
    dataIndex: 'stepCount',
    key: 'stepCount',
    sorter: {
      compare: (a, b) => a.stepCount - b.stepCount,
      multiple: 3,
    },
  },
  {
    title: 'Heart Rate',
    dataIndex: 'heartRate',
    key: 'heartRate',
    sorter: {
      compare: (a, b) => a.heartRate - b.heartRate,
      multiple: 3,
    },
  },
  {
    title: 'Hrs of Rest',
    dataIndex: 'hrsOfSleep',
    key: 'hrsOfSleep',
    sorter: {
      compare: (a, b) => a.hrsOfSleep - b.hrsOfSleep,
      multiple: 3,
    },
  },
  {
    title: 'Activeness',
    key: 'pfTags',
    dataIndex: 'pfTags',
    render: (_, { pfTags }) => (
      <>
        {pfTags.map((pfTag) => {
          let color = 'yellow';
          if (pfTag === 'poor') {
            color = 'red';
          }
          else if (pfTag === 'good') {
            color = 'green';
          }
          return (
            <Tag color={color} key={pfTag}>
              {pfTag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: 'Pain',
    key: 'piTags',
    dataIndex: 'piTags',
    render: (_, { piTags }) => (
      <>
        {piTags.map((piTag) => {
          let color = 'yellow';
          if (piTag === 'severe') {
            color = 'red';
          }
          else if (piTag === 'good') {
            color = 'green';
          }
          return (
            <Tag color={color} key={piTag}>
              {piTag.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
];

export default tableColumns;
