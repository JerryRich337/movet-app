import React, { useState, useEffect } from "react";
import './App.css';
import 'antd/dist/reset.css';
import { Layout, Card, Typography, Row, Col, Input, Select, Tabs, Empty, Spin, Button, Modal, Upload, message, Form, InputNumber } from 'antd';
import { PlusOutlined, UploadOutlined, EditOutlined } from '@ant-design/icons';
import Graph from "./atoms/graph/Graph";
import { stepCountAll, heartRateAll, hrsOfSleepAll } from "./data/graph/Axes";
import Timeline from "./data/timeline/Timeline";
import { supabase } from "./supabaseClient";

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const RANGE_CONFIG = {
    '4D': { label: '4D', mode: 'cards' },
    '1M': { label: '1M', mode: 'graph', buckets: 8 },
    '6M': { label: '6M', mode: 'graph', buckets: 46 },
    '1Y': { label: '1Y', mode: 'graph', buckets: 91 },
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toStartOfDay = (value) => {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const formatDashboardDate = (date) => {
    const safeDate = toStartOfDay(date);
    const month = String(safeDate.getMonth() + 1).padStart(2, '0');
    const day = String(safeDate.getDate()).padStart(2, '0');
    return `${month}/${day}`;
};

const buildRangeSeries = (athletes, bucketCount) => {
    const today = toStartOfDay();
    const counts = Array.from({ length: bucketCount }, () => null);

    athletes.forEach((athlete) => {
        if (!athlete || !athlete.inserted_at) return;
        const athleteDate = toStartOfDay(athlete.inserted_at);
        const diffDays = Math.floor((today.getTime() - athleteDate.getTime()) / MS_PER_DAY);
        if (diffDays < 0 || diffDays >= bucketCount * 4) return;

        const bucketFromRight = Math.floor(diffDays / 4);
        const bucketIndex = bucketCount - 1 - bucketFromRight;
        if (bucketIndex < 0 || bucketIndex >= bucketCount) return;

        counts[bucketIndex] = (counts[bucketIndex] || 0) + 1;
    });

    const categories = Array.from({ length: bucketCount }, (_, idx) => {
        const offset = (bucketCount - 1 - idx) * 4;
        return formatDashboardDate(addDays(today, -offset));
    });

    return { categories, data: counts };
};

const Dashboard = (props) => {
    const [athletes, setAthletes] = useState([]);
    const [emptyGroups, setEmptyGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("menu"); // "menu" or "manual"
    const [editingAthlete, setEditingAthlete] = useState(null);
    const [form] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [rangeView, setRangeView] = useState('4D');

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchUserAthletes = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from('athletes')
                        .select('*')
                        .eq('user_id', user.id);

                    if (!error && data) {
                        setAthletes(data);
                    }
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAthletes();
    }, []);

    const showModal = () => {
        setEditingAthlete(null);
        setModalMode("menu");
        setIsModalOpen(true);
    };

    const handleAddEventGroup = () => {
        const tempId = `empty_${Date.now()}`;
        setEmptyGroups(prev => [...prev, { tempId, rawDate: '', isNew: true }]);
    };

    const handleSaveNewGroup = (tempId, dateStr) => {
        const existingDates = new Set(athletes.map(a => a.inserted_at ? a.inserted_at.split('T')[0] : ''));
        const isDuplicate = existingDates.has(dateStr) || emptyGroups.some(g => g.tempId !== tempId && g.rawDate === dateStr);

        if (isDuplicate) {
            message.warning("A group with this date already exists.");
            setEmptyGroups(prev => prev.filter(g => g.tempId !== tempId));
        } else {
            setEmptyGroups(prev => prev.map(g => g.tempId === tempId ? { ...g, rawDate: dateStr, isNew: false } : g));
        }
    };

    const handleRemoveEmptyGroup = (tempId) => {
        setEmptyGroups(prev => prev.filter(g => g.tempId !== tempId));
    };

    const handleEditAthlete = (athlete) => {
        setEditingAthlete(athlete);
        const nameParts = athlete.name ? athlete.name.split(', ') : ['', ''];
        const lastName = nameParts[0] || '';
        const firstName = nameParts[1] || '';

        const stepMetric = athlete.metricData?.find(m => m.metric === 'Step Count');
        const hrMetric = athlete.metricData?.find(m => m.metric === 'Heart Rate');
        const restMetric = athlete.metricData?.find(m => m.metric === 'Hrs of Rest');

        form.setFieldsValue({
            firstName: firstName,
            lastName: lastName,
            stepCount: stepMetric ? stepMetric.data[stepMetric.data.length - 1] : 0,
            heartRate: hrMetric ? hrMetric.data[hrMetric.data.length - 1] : 0,
            hrsOfRest: restMetric ? restMetric.data[restMetric.data.length - 1] : 0,
        });

        setModalMode("manual");
        setIsModalOpen(true);
    };

    const handleDeleteAthlete = async (athlete) => {
        try {
            const { error } = await supabase
                .from('athletes')
                .delete()
                .eq('id', athlete.id);

            if (error) {
                console.error("Supabase delete error:", error);
                message.error("Failed to delete athlete.");
            } else {
                setAthletes(prev => prev.filter(a => a.id !== athlete.id));
                message.success("Athlete card deleted successfully.");
            }
        } catch (err) {
            console.error("Error deleting athlete:", err);
            message.error("An unexpected error occurred while deleting.");
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingAthlete(null);
        form.resetFields();
    };

    const handleManualSubmit = async (values) => {
        setConfirmLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                message.error("You must be logged in to save an athlete.");
                setConfirmLoading(false);
                return;
            }

            const formattedName = `${values.lastName.trim()}, ${values.firstName.trim()}`;

            const newMetricData = [
                {
                    metric: 'Step Count',
                    data: [values.stepCount],
                    avg: values.stepCount,
                    percentage: 0,
                    arrow: 'mid'
                },
                {
                    metric: 'Heart Rate',
                    data: [values.heartRate],
                    avg: values.heartRate,
                    percentage: 0,
                    arrow: 'mid'
                },
                {
                    metric: 'Hrs of Rest',
                    data: [values.hrsOfRest],
                    avg: values.hrsOfRest,
                    percentage: 0,
                    arrow: 'mid'
                }
            ];

            if (editingAthlete) {
                const updatedFields = {
                    name: formattedName,
                    metricData: newMetricData,
                };

                const { data, error } = await supabase
                    .from('athletes')
                    .update(updatedFields)
                    .eq('id', editingAthlete.id)
                    .select();

                if (error) {
                    console.error("Supabase update error:", error);
                    message.error("Failed to update athlete record.");
                } else if (data && data.length > 0) {
                    setAthletes(prev => prev.map(a => a.id === editingAthlete.id ? data[0] : a));
                    message.success("Athlete card updated successfully!");
                    setIsModalOpen(false);
                    setEditingAthlete(null);
                    form.resetFields();
                }
            } else {
                const newAthleteRecord = {
                    user_id: user.id,
                    name: formattedName,
                    metricData: newMetricData,
                    pfTags: ['moderate'],
                    piTags: ['moderate'],
                    dotColor: '#52c41a',
                    currentWeek: 1,
                };

                const { data, error } = await supabase
                    .from('athletes')
                    .insert([newAthleteRecord])
                    .select();

                if (error) {
                    console.error("Supabase insert error:", error);
                    message.error("Failed to save athlete record.");
                } else if (data && data.length > 0) {
                    setAthletes((prev) => [...prev, data[0]]);
                    message.success("Athlete card added successfully!");
                    setIsModalOpen(false);
                    form.resetFields();
                }
            }
        } catch (err) {
            console.error("Error saving manual entry:", err);
            message.error("An unexpected error occurred.");
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleUpdateGroupDate = async (athleteIds, newIsoDate) => {
        try {
            const { error } = await supabase
                .from('athletes')
                .update({ inserted_at: newIsoDate })
                .in('id', athleteIds);

            if (error) {
                console.error("Supabase date update error:", error);
                message.error("Failed to update date.");
            } else {
                setAthletes(prev => prev.map(a => athleteIds.includes(a.id) ? { ...a, inserted_at: newIsoDate } : a));
                message.success("Date updated successfully!");
            }
        } catch (err) {
            console.error("Error updating date:", err);
            message.error("An unexpected error occurred.");
        }
    };

    const handleMoveAthlete = async (athleteId, targetRawDate) => {
        try {
            const newIsoDate = `${targetRawDate}T00:00:00.000Z`;
            const { error } = await supabase
                .from('athletes')
                .update({ inserted_at: newIsoDate })
                .eq('id', athleteId);

            if (error) {
                console.error("Supabase move error:", error);
                message.error("Failed to move athlete card.");
            } else {
                setAthletes(prev => prev.map(a => String(a.id) === String(athleteId) ? { ...a, inserted_at: newIsoDate } : a));
                // Clean up any empty group matching targetRawDate now that it received a card
                setEmptyGroups(prev => prev.filter(g => g.rawDate !== targetRawDate));
                message.success("Athlete card moved successfully!");
            }
        } catch (err) {
            console.error("Error moving athlete:", err);
            message.error("An unexpected error occurred while moving.");
        }
    };

    const onSearch = (value) => console.log(value);
    const handleChange = (value) => { console.log(`${value}`); };
    const onChange1 = (key) => { console.log(key); };

    const renderableAthletes = athletes.filter((athlete) => {
        const week = Number(athlete?.currentWeek);
        return Number.isFinite(week) && week >= 0;
    });
    const hasContent = renderableAthletes.length > 0 || emptyGroups.length > 0;

    const rangeChartConfig = RANGE_CONFIG[rangeView] || RANGE_CONFIG['4D'];
    const rangeSeries = rangeChartConfig.mode === 'graph'
        ? buildRangeSeries(renderableAthletes, rangeChartConfig.buckets)
        : null;

    const rangeChartOptions = rangeChartConfig.mode === 'graph' ? {
        chart: {
            type: 'bar',
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                columnWidth: '55%',
                borderRadius: 4,
            }
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: rangeSeries ? rangeSeries.categories : [],
            labels: {
                rotate: -45,
                trim: false,
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            show: false,
        },
        grid: {
            show: false,
        },
        tooltip: {
            enabled: true,
        },
        colors: ['#904199'],
    } : null;

    const rangeTabs = [
        { key: '4D', label: '4D' },
        { key: '1M', label: '1M' },
        { key: '6M', label: '6M' },
        { key: '1Y', label: '1Y' },
    ].map((item) => ({
        key: item.key,
        label: item.label,
        children: null,
    }));

    const metrics = [
        {
          key: '1',
          label: `Step Count`,
          children: (
            <div>
              <Graph options={stepCountAll} series={[]} type="line" />
            </div>
          ),
        },
        {
          key: '2',
          label: `Heart Rate`,
          children: (
            <div>
              <Graph options={heartRateAll} series={[]} type="line" />
            </div>
          ),
        },
        {
          key: '3',
          label: `Hrs of Rest`,
          children: (
            <div>
              <Graph options={hrsOfSleepAll} series={[]} type="line" />
            </div>
          ),
        },
    ];

    if (loading) {
        return (
            <Content id="dashboard" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <Spin size="large" />
            </Content>
        );
    }

    return (
        <Content id="dashboard">
            <Card size="large" className="card">
                <Row className="card-top-row" align="middle" justify="space-between">
                <Col>
                  <Title level={2} className="card-title athlete-list-title" style={{ margin: 0 }}>Athlete List</Title>
                </Col>
                <Col>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={showModal} 
                      style={{ background: "#904199", display: "flex", alignItems: "center" }}
                    >
                      Add Athlete
                    </Button>
                    <Button 
                      icon={<PlusOutlined />} 
                      onClick={handleAddEventGroup} 
                      style={{ borderColor: "#904199", color: "#904199", display: "flex", alignItems: "center", width: "100%" }}
                    >
                      Add Event
                    </Button>
                  </div>
                </Col>
                </Row>
                <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                    {!hasContent ? (
                        <Empty 
                            style={{ padding: "40px 0" }} 
                            description={
                                <span>
                                    No athlete records found. Click "Add Athlete" or "Add Event" to create your first entry!
                                </span>
                            } 
                        />
                    ) : (
                        <>
                            <Tabs
                                className="athlete-range-tabs"
                                activeKey={rangeView}
                                onChange={setRangeView}
                                items={rangeTabs}
                            />
                            {rangeView === '4D' ? (
                                <Timeline 
                                    athletes={renderableAthletes} 
                                    emptyGroups={emptyGroups}
                                    setIndex={props.setIndex} 
                                    onEdit={handleEditAthlete}
                                    onDelete={handleDeleteAthlete}
                                    onUpdateDate={handleUpdateGroupDate}
                                    onMoveAthlete={handleMoveAthlete}
                                    onSaveNewGroup={handleSaveNewGroup}
                                    onRemoveEmptyGroup={handleRemoveEmptyGroup}
                                />
                            ) : (
                                <div style={{ marginTop: 8 }}>
                                    <Graph
                                        options={rangeChartOptions}
                                        series={[{ name: 'Athlete Cards', data: rangeSeries ? rangeSeries.data : [] }]}
                                        type="bar"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </Col>
                </Row>
            </Card>

            <Card size="large" className="card">
                <Row className="card-top-row" align="middle" justify="space-between">
                <Col>
                  <Title level={2} className="card-title" style={{ margin: 0 }}>Team Data</Title>
                </Col>
                </Row>
                <Row style={{ marginTop: 16 }}>
                <Col span={24}>
                    {!hasContent ? (
                        <Empty 
                            style={{ padding: "40px 0" }} 
                            description={
                                <span>
                                    No team data available. Add athlete records to view team metrics and graphs.
                                </span>
                            } 
                        />
                    ) : (
                        <>
                            <Row style={{ marginBottom: 16 }} justify="end">
                                <Col className="card-filters">
                                    <Search id="search" placeholder="Search..." onSearch={onSearch} className="card-filter"/>
                                    <Select
                                        mode="single"
                                        className="filter"
                                        placeholder="Filter by Event(s)"
                                        onChange={handleChange}
                                        optionLabelProp="label"
                                    >
                                    <Option value="All Events" label="All Events" />
                                    <Option value="Events 1-3" label="Events 1-3" />
                                    <Option value="Events 4-6" label="Events 4-6" />
                                    <Option value="Events 7-9" label="Events 7-9" />
                                    <Option value="Events 10+" label="Events 10+" />
                                    </Select>
                                </Col>
                            </Row>
                            <Tabs id="metric-tabs" className="tabs" defaultActiveKey="1" items={metrics} onChange={onChange1} />
                        </>
                    )}
                </Col>
                </Row>
            </Card>

            {/* Add/Edit Athlete Modal */}
            <Modal 
                title={editingAthlete ? "Edit Athlete Entry" : (modalMode === "menu" ? "Add Athlete Data" : "Manual Athlete Entry")} 
                open={isModalOpen} 
                onCancel={handleCancel} 
                footer={null}
                centered
            >
                {modalMode === "menu" && !editingAthlete ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "15px 0" }}>
                        <div>
                            <p style={{ fontWeight: 500, marginBottom: "8px", color: "#333" }}>Option 1: Upload Fitbit Data File</p>
                            <Upload 
                                beforeUpload={(file) => {
                                    message.success(`${file.name} selected successfully.`);
                                    setIsModalOpen(false);
                                    return false; 
                                }}
                                showUploadList={false}
                            >
                                <Button icon={<UploadOutlined />} block style={{ height: "48px", borderColor: "#904199", color: "#904199" }}>
                                    Upload Fitbit File (.csv / .json)
                                </Button>
                            </Upload>
                        </div>
                        
                        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
                            <p style={{ fontWeight: 500, marginBottom: "8px", color: "#333" }}>Option 2: Manual Entry</p>
                            <Button 
                                type="dashed" 
                                icon={<EditOutlined />} 
                                block 
                                style={{ height: "48px" }}
                                onClick={() => setModalMode("manual")}
                            >
                                Enter Data Manually
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleManualSubmit}
                        style={{ padding: "10px 0" }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="First Name"
                                    name="firstName"
                                    rules={[{ required: true, message: 'Please enter first name' }]}
                                >
                                    <Input placeholder="e.g. John" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Last Name"
                                    name="lastName"
                                    rules={[{ required: true, message: 'Please enter last name' }]}
                                >
                                    <Input placeholder="e.g. Doe" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Step Count"
                            name="stepCount"
                            rules={[{ required: true, message: 'Please enter step count' }]}
                        >
                            <InputNumber placeholder="e.g. 2500" style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label="Heart Rate"
                            name="heartRate"
                            rules={[{ required: true, message: 'Please enter heart rate' }]}
                        >
                            <InputNumber placeholder="e.g. 75" style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label="Hrs of Rest"
                            name="hrsOfRest"
                            rules={[{ required: true, message: 'Please enter hours of rest' }]}
                        >
                            <InputNumber placeholder="e.g. 7.5" step={0.1} style={{ width: '100%' }} />
                        </Form.Item>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                            {!editingAthlete && <Button onClick={() => setModalMode("menu")}>Back</Button>}
                            <Button type="primary" htmlType="submit" loading={confirmLoading} style={{ background: "#904199" }}>
                                Ok
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal>
        </Content>
    );
};

export default Dashboard;