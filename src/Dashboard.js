import React, { useEffect } from "react";
import './App.css';
import 'antd/dist/reset.css';
import { Layout, Card, Typography, Row, Col, Input, Select, Tabs } from 'antd';
import Graph from "./atoms/graph/Graph";
import { stepCountAll, heartRateAll, hrsOfSleepAll } from "./data/graph/Axes";
import { stepCountData, heartRateData, hrsOfSleepData } from "./data/graph/GraphData";
import Timeline from "./data/timeline/Timeline";
const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;


const onSearch = (value) => console.log(value);
const handleChange = (value) => {
  console.log(`${value}`);
};
const onChange1 = (key) => {
  console.log(key);
};



const Dashboard = (props) => {

    useEffect(() => {
        window.scrollTo(0, 0)
      }, [])

    const metrics = [
        {
          key: '1',
          label: `Step Count`,
          children: <div>
            <Graph options={stepCountAll} series={stepCountData} type="line" />
            {/* <Watchlist metric="Step Count" setIndex={props.setIndex} /> */}
          </div>,
        },
        {
          key: '2',
          label: `Heart Rate`,
          children: <div>
            <Graph options={heartRateAll} series={heartRateData} type="line" />
            {/* <Watchlist metric="Heart Rate" setIndex={props.setIndex} /> */}
          </div>,
        },
        {
          key: '3',
          label: `Hrs of Rest`,
          children: <div>
            <Graph options={hrsOfSleepAll} series={hrsOfSleepData} type="line" />
            {/* <Watchlist metric="Hrs of Rest" setIndex={props.setIndex} /> */}
          </div>,
        },
      ];

    return (

        <Content id="dashboard">
            <Card size="large" className="card">
                <Row className="card-top-row" align="middle">
                <Col span={24}>
                  <Title level={2} className="card-title athlete-list-title">Athlete List</Title>
                </Col>
                </Row>
                <Row>
                <Col span={24}>
                    <Timeline setIndex={props.setIndex}/>
                </Col>
                </Row>
            </Card>
            <Card size="large" className="card">
                <Row className="card-top-row" align="middle">
                <Col span={16}>
                  <Title level={2} className="card-title">Team Data</Title>
                </Col>
                <Col className="card-filters">
                    <Search id="search" placeholder="Search..." onSearch={onSearch} className="card-filter"/>
                    <Select
                        mode="single"
                        className="filter"
                        placeholder="Filter by Event(s)"
                        onChange={handleChange}
                        optionLabelProp="label"
                    >
                    <Option value="All Events" label="All Events">
                    </Option>
                    <Option value="Events 1-3" label="Events 1-3">
                    </Option>
                    <Option value="Events 4-6" label="Events 4-6">
                    </Option>
                    <Option value="Events 7-9" label="Events 7-9">
                    </Option>
                    <Option value="Events 10+" label="Events 10+">
                    </Option>
                    </Select>
                </Col>
                </Row>
                <Row>
                <Col span={24}>
                    <Tabs id="metric-tabs" className="tabs" defaultActiveKey="1" items={metrics} onChange={onChange1} />
                </Col>
                </Row>
            </Card>
        </Content>
      
    );
}

export default Dashboard;
