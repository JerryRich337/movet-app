import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import 'antd/dist/reset.css';
import Navbar from "./atoms/navbar/Navbar";
import { ConfigProvider, Layout, Card, Form, Input, Button, Typography, Radio, Tabs, Space, message } from 'antd';
import Athlete from "./Athlete";
import Dashboard from "./Dashboard";
import { supabase } from "./supabaseClient";

const { Title, Paragraph } = Typography;

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  var [patientIndex, setPatientIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          email: session.user.email,
          tier: session.user.user_metadata?.tier || "free"
        });
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          email: session.user.email,
          tier: session.user.user_metadata?.tier || "free"
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real Login Function
  const handleLogin = async (values) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      message.error(error.message);
    } else {
      message.success("Logged in successfully!");
    }
  };

  // Real Registration Function
  const handleRegister = async (values) => {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          tier: values.tier || "free",
        },
      },
    });

    if (error) {
      message.error(error.message);
    } else {
      message.success("Account created successfully! You can now log in.");
    }
  };

  // Real Logout Function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    message.info("Logged out.");
  };

  if (loading) {
    return null;
  }

  // Gatekeeper screen if not logged in
  if (!user) {
    return (
      <ConfigProvider
        theme={{
          token: {
            "colorPrimary": "#904199",
            "colorBorderSecondary": "#f0f0f0",
            "borderRadius": 8,
            "colorInfo": "#904199",
            "colorSuccess": "#52c41a",
            "colorWarning": "#fbaf5d",
            "colorError": "#f37f89",
            "fontSizeHeading4": 18,
            "fontSizeHeading5": 14,
          }
        }}
      >
        <Layout className="App" style={{ minHeight: "100vh", justifyContent: "center", alignItems: "center", background: "#f5f5f5", padding: "20px" }}>
          <Card style={{ width: "100%", maxWidth: 500, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Title level={2} style={{ color: "#904199", margin: 0 }}>Movet Dashboard</Title>
              <Paragraph type="secondary">Sign in or register with Supabase backend</Paragraph>
            </div>

            <Tabs
              defaultActiveKey="login"
              centered
              items={[
                {
                  key: "login",
                  label: "Login",
                  children: (
                    <Form layout="vertical" onFinish={handleLogin}>
                      <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please input your email!" }]}>
                        <Input placeholder="Enter your email" />
                      </Form.Item>
                      <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please input your password!" }]}>
                        <Input.Password placeholder="Enter your password" />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ background: "#904199" }}>
                          Login
                        </Button>
                      </Form.Item>
                    </Form>
                  ),
                },
                {
                  key: "register",
                  label: "Register",
                  children: (
                    <Form layout="vertical" onFinish={handleRegister} initialValues={{ tier: "free" }}>
                      <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please input your email!" }]}>
                        <Input placeholder="Enter your email" />
                      </Form.Item>
                      <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please input your password!" }]}>
                        <Input.Password placeholder="Create a password" />
                      </Form.Item>

                      <Form.Item label="Select Your Subscription Tier" name="tier" rules={[{ required: true, message: "Please select a tier!" }]}>
                        <Radio.Group style={{ width: "100%" }}>
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <Radio.Button value="free" style={{ width: "100%", height: "auto", padding: "10px" }}>
                              <strong>Tier 1: Free</strong> ($0/mo) <br />
                              <span style={{ fontSize: "12px", color: "#666" }}>Standard performance & limited data pool.</span>
                            </Radio.Button>
                            <Radio.Button value="pro" style={{ width: "100%", height: "auto", padding: "10px" }}>
                              <strong>Tier 2: Pro</strong> ($14.99/mo) <br />
                              <span style={{ fontSize: "12px", color: "#666" }}>Enhanced performance & expanded data limits.</span>
                            </Radio.Button>
                            <Radio.Button value="enterprise" style={{ width: "100%", height: "auto", padding: "10px" }}>
                              <strong>Tier 3: Enterprise</strong> ($49.99/mo) <br />
                              <span style={{ fontSize: "12px", color: "#666" }}>Maximum performance, priority throughput & full analytics.</span>
                            </Radio.Button>
                          </Space>
                        </Radio.Group>
                      </Form.Item>

                      <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ background: "#904199" }}>
                          Create Account & Get Started
                        </Button>
                      </Form.Item>
                    </Form>
                  ),
                },
              ]}
            />
          </Card>
        </Layout>
      </ConfigProvider>
    );
  }

  // Authenticated Main Dashboard App
  return (
    <ConfigProvider
      theme={{
        token: {
          "colorPrimary": "#904199",
          "colorBorderSecondary": "#f0f0f0",
          "borderRadius": 8,
          "colorInfo": "#904199",
          "colorSuccess": "#52c41a",
          "colorWarning": "#fbaf5d",
          "colorError": "#f37f89",
          "fontSizeHeading4": 18,
          "fontSizeHeading5": 14,
        }
      }}
    >
      <Layout className="App">
        <Navbar />
        <div style={{ background: "#fafafa", padding: "6px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}>
          <span>Logged in as: <strong>{user.email}</strong> | Active Tier: <strong style={{ textTransform: "uppercase", color: "#904199" }}>{user.tier}</strong></span>
          <Button type="link" size="small" onClick={handleLogout} style={{ color: "#ff4d4f" }}>Logout</Button>
        </div>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard setIndex={setPatientIndex} userTier={user.tier} />} />
            <Route path="/athlete" element={<Athlete index={patientIndex} userTier={user.tier} />} />
            <Route path="/patient" element={<Athlete index={patientIndex} userTier={user.tier} />} />
          </Routes> 
        </Router>
      </Layout>
    </ConfigProvider>
  );
};

export default App;