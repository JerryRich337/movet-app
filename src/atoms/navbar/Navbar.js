import React from 'react';
import './Navbar.css';
import { Typography, Layout, Avatar} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Title } = Typography;
const { Header } = Layout;

function Navbar() {
  return (
      <Header className="header">
      <Title level={4} id="title">Movet Dashboard</Title>
      <div id="user">
        <Avatar size="small" icon={<UserOutlined />} />
        <Title level={5} id="username">Markus Church</Title>
      </div>
      </Header>
  );
};

export default Navbar;