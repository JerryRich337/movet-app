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
    '1M': { label: '1M', mode: 'graph', unit: 'day', buckets: 8 },
    '6M': { label: '6M', mode: 'graph', unit: 'month', buckets: 6 },
    '1Y': { label: '1Y', mode: 'graph', unit: 'day', buckets: 91 },
};

// Team Data graphs: date-based x axis (no event numbers), spacing/point counts per tab
const TEAM_RANGE_CONFIG = {
    '4D': { unit: 'day', buckets: 4, step: 1 },
    '1M': { unit: 'day', buckets: 8, step: 4 },
    '6M': { unit: 'month', buckets: 6, step: 1 },
    '1Y': { unit: 'year', buckets: 6, step: 1 },
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const ATHLETE_NAME_COLORS = [
    '#904199', '#E53935', '#52c41a', '#fbaf5d', '#1890ff',
    '#13c2c2', '#eb2f96', '#faad14', '#722ed1', '#2f54eb',
    '#a0d911', '#fa541c', '#08979c', '#c41d7f', '#7cb305',
];

// Deterministic color per athlete name so the same athlete always gets the same color
const getColorForAthleteName = (name) => {
    const safeName = name || '';
    let hash = 0;
    for (let i = 0; i < safeName.length; i++) {
        hash = (hash * 31 + safeName.charCodeAt(i)) >>> 0;
    }
    return ATHLETE_NAME_COLORS[hash % ATHLETE_NAME_COLORS.length];
};

// Builds the date categories for a Team Data tab plus a lookup from an athlete's
// inserted_at date to the bucket index it belongs in.
const buildTeamRangeMeta = (config, anchor) => {
    const { unit, buckets, step } = config;

    if (unit === 'month') {
        const anchorDate = toStartOfDay(anchor);
        const anchorMonthIndex = anchorDate.getFullYear() * 12 + anchorDate.getMonth();
        const categories = Array.from({ length: buckets }, (_, idx) => {
            const monthsAgo = (buckets - 1 - idx) * step;
            const totalMonthIndex = anchorMonthIndex - monthsAgo;
            const year = Math.floor(totalMonthIndex / 12);
            const month = ((totalMonthIndex % 12) + 12) % 12;
            return formatMonthLabel(year, month);
        });
        const getBucketIndex = (date) => {
            const athleteDate = toStartOfDay(date);
            const athleteMonthIndex = athleteDate.getFullYear() * 12 + athleteDate.getMonth();
            const monthsAgo = anchorMonthIndex - athleteMonthIndex;
            if (monthsAgo < 0 || monthsAgo >= buckets * step) return -1;
            const bucketIndex = buckets - 1 - Math.floor(monthsAgo / step);
            return bucketIndex >= 0 && bucketIndex < buckets ? bucketIndex : -1;
        };
        return { categories, getBucketIndex };
    }

    if (unit === 'year') {
        const anchorYear = toStartOfDay(anchor).getFullYear();
        const categories = Array.from({ length: buckets }, (_, idx) => {
            const yearsAgo = (buckets - 1 - idx) * step;
            return String(anchorYear - yearsAgo);
        });
        const getBucketIndex = (date) => {
            const athleteYear = toStartOfDay(date).getFullYear();
            const yearsAgo = anchorYear - athleteYear;
            if (yearsAgo < 0 || yearsAgo >= buckets * step) return -1;
            const bucketIndex = buckets - 1 - Math.floor(yearsAgo / step);
            return bucketIndex >= 0 && bucketIndex < buckets ? bucketIndex : -1;
        };
        return { categories, getBucketIndex };
    }

    // unit === 'day'
    const today = toStartOfDay(anchor);
    const categories = Array.from({ length: buckets }, (_, idx) => {
        const offset = (buckets - 1 - idx) * step;
        return formatDashboardDate(addDays(today, -offset));
    });
    const getBucketIndex = (date) => {
        const athleteDate = toStartOfDay(date);
        const diffDays = Math.floor((today.getTime() - athleteDate.getTime()) / MS_PER_DAY);
        if (diffDays < 0 || diffDays >= buckets * step) return -1;
        const bucketIndex = buckets - 1 - Math.floor(diffDays / step);
        return bucketIndex >= 0 && bucketIndex < buckets ? bucketIndex : -1;
    };
    return { categories, getBucketIndex };
};

const buildTeamMetricSeries = (athletes, metricName, meta, bucketCount) => {
    const seriesByAthlete = new Map();

    athletes.forEach((athlete) => {
        if (!athlete?.name || !athlete.inserted_at) return;

        const metric = athlete.metricData?.find((item) => item.metric === metricName);
        const value = metric?.data?.[metric.data.length - 1];
        if (!Number.isFinite(Number(value))) return;

        const bucketIndex = meta.getBucketIndex(athlete.inserted_at);
        if (bucketIndex < 0) return;

        if (!seriesByAthlete.has(athlete.name)) {
            seriesByAthlete.set(athlete.name, Array(bucketCount).fill(null));
        }

        seriesByAthlete.get(athlete.name)[bucketIndex] = Number(value);
    });

    return Array.from(seriesByAthlete, ([name, data]) => ({
        name,
        data,
    }));
};

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

const toRawDateString = (date) => {
    const safeDate = toStartOfDay(date);
    const year = safeDate.getFullYear();
    const month = String(safeDate.getMonth() + 1).padStart(2, '0');
    const day = String(safeDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const buildRangeSeries = (athletes, bucketCount, anchorDate) => {
    const today = toStartOfDay(anchorDate);
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

const formatMonthLabel = (year, month) => {
    const date = new Date(year, month, 1);
    return `${date.toLocaleString('default', { month: 'short' })} ${year}`;
};

const buildMonthlySeries = (athletes, monthCount, anchorDate) => {
    const anchor = toStartOfDay(anchorDate);
    const anchorMonthIndex = anchor.getFullYear() * 12 + anchor.getMonth();
    const counts = Array.from({ length: monthCount }, () => null);

    athletes.forEach((athlete) => {
        if (!athlete || !athlete.inserted_at) return;
        const athleteDate = toStartOfDay(athlete.inserted_at);
        const athleteMonthIndex = athleteDate.getFullYear() * 12 + athleteDate.getMonth();
        const monthsAgo = anchorMonthIndex - athleteMonthIndex;
        if (monthsAgo < 0 || monthsAgo >= monthCount) return;

        const bucketIndex = monthCount - 1 - monthsAgo;
        counts[bucketIndex] = (counts[bucketIndex] || 0) + 1;
    });

    const categories = Array.from({ length: monthCount }, (_, idx) => {
        const monthsAgo = monthCount - 1 - idx;
        const totalMonthIndex = anchorMonthIndex - monthsAgo;
        const year = Math.floor(totalMonthIndex / 12);
        const month = ((totalMonthIndex % 12) + 12) % 12;
        return formatMonthLabel(year, month);
    });

    return { categories, data: counts };
};

// Last calendar day of the given month, clamped so it never lands in the future
const lastDayOfMonth = (year, month, notAfter) => {
    const end = new Date(year, month + 1, 0);
    return end > notAfter ? notAfter : end;
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
    const [teamRangeView, setTeamRangeView] = useState('4D');
    const [focusRange, setFocusRange] = useState(null);
    const [monthAnchor, setMonthAnchor] = useState(null);

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
        // Adding an event date always needs the full, unfiltered 4D view
        setRangeView('4D');
        setFocusRange(null);
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

    const handleDeleteGroup = async (group) => {
        try {
            const ids = (group.athletes || []).map(a => a.id);
            if (ids.length > 0) {
                const { error } = await supabase
                    .from('athletes')
                    .delete()
                    .in('id', ids);

                if (error) {
                    console.error("Supabase group delete error:", error);
                    message.error("Failed to delete date group.");
                    return;
                }
                setAthletes(prev => prev.filter(a => !ids.includes(a.id)));
            }
            if (group.tempId) {
                setEmptyGroups(prev => prev.filter(g => g.tempId !== group.tempId));
            } else if (group.rawDate) {
                setEmptyGroups(prev => prev.filter(g => g.rawDate !== group.rawDate));
            }
            message.success("Date group removed.");
        } catch (err) {
            console.error("Error deleting date group:", err);
            message.error("An unexpected error occurred while deleting the group.");
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

    const handleRangeViewChange = (key) => {
        setRangeView(key);
        if (key === '4D') {
            // Manually returning to 4D should show the default, unfiltered view
            setFocusRange(null);
        }
        // Manually picking a tab always drops any chart-driven drill-down anchor
        setMonthAnchor(null);
    };

    const handleRangeColumnClick = (bucketIndex) => {
        const bucketCount = rangeChartConfig.buckets;
        if (!Number.isFinite(bucketIndex) || !bucketCount) return;
        const offset = (bucketCount - 1 - bucketIndex) * 4;
        const endDate = addDays(rangeAnchor, -offset);
        const startDate = addDays(endDate, -3);
        setFocusRange({ start: toRawDateString(startDate), end: toRawDateString(endDate) });
        setRangeView('4D');
    };

    const handleMonthColumnClick = (bucketIndex) => {
        const bucketCount = rangeChartConfig.buckets;
        if (!Number.isFinite(bucketIndex) || !bucketCount) return;
        const today = toStartOfDay();
        const todayMonthIndex = today.getFullYear() * 12 + today.getMonth();
        const monthsAgo = bucketCount - 1 - bucketIndex;
        const totalMonthIndex = todayMonthIndex - monthsAgo;
        const year = Math.floor(totalMonthIndex / 12);
        const month = ((totalMonthIndex % 12) + 12) % 12;
        setMonthAnchor(lastDayOfMonth(year, month, today));
        setRangeView('1M');
    };

    const renderableAthletes = athletes.filter((athlete) => {
        const week = Number(athlete?.currentWeek);
        return Number.isFinite(week) && week >= 0;
    });
    const hasContent = renderableAthletes.length > 0 || emptyGroups.length > 0;

    const rangeChartConfig = RANGE_CONFIG[rangeView] || RANGE_CONFIG['4D'];
    const rangeAnchor = rangeView === '1M' && monthAnchor ? monthAnchor : toStartOfDay();
    const rangeSeries = rangeChartConfig.mode === 'graph'
        ? (rangeChartConfig.unit === 'month'
            ? buildMonthlySeries(renderableAthletes, rangeChartConfig.buckets, rangeAnchor)
            : buildRangeSeries(renderableAthletes, rangeChartConfig.buckets, rangeAnchor))
        : null;

    const rangeChartOptions = rangeChartConfig.mode === 'graph' ? {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            events: {
                dataPointSelection: (event, chartContext, config) => {
                    if (rangeChartConfig.unit === 'month') {
                        handleMonthColumnClick(config.dataPointIndex);
                    } else {
                        handleRangeColumnClick(config.dataPointIndex);
                    }
                },
            },
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

    const teamRangeTabs = [
        { key: '4D', label: '4D' },
        { key: '1M', label: '1M' },
        { key: '6M', label: '6M' },
        { key: '1Y', label: '1Y' },
    ].map((item) => ({
        key: item.key,
        label: item.label,
        children: null,
    }));

    const uniqueAthleteNames = Array.from(
        new Set(renderableAthletes.map((athlete) => athlete?.name).filter(Boolean))
    );
    const teamChartConfig = TEAM_RANGE_CONFIG[teamRangeView] || TEAM_RANGE_CONFIG['4D'];
    const teamRangeMeta = buildTeamRangeMeta(teamChartConfig, new Date());
    const teamMetricOptions = (baseOptions) => ({
        ...baseOptions,
        chart: {
            ...baseOptions.chart,
            toolbar: { show: false },
        },
        xaxis: {
            ...baseOptions.xaxis,
            categories: teamRangeMeta.categories,
        },
        colors: uniqueAthleteNames.map(getColorForAthleteName),
        legend: { show: false },
    });
    const renderAthleteLegend = () => (
        <div className="athlete-metric-legend" aria-label="Athlete legend">
            {uniqueAthleteNames.map((name) => (
                <span key={name} className="athlete-metric-legend-item">
                    <span
                        className="athlete-metric-legend-dot"
                        style={{ backgroundColor: getColorForAthleteName(name) }}
                    />
                    <span
                        className="athlete-metric-legend-label"
                        style={{ color: getColorForAthleteName(name) }}
                    >
                        {name}
                    </span>
                </span>
            ))}
        </div>
    );

    const metrics = [
        {
          key: '1',
          label: `Step Count`,
          children: (
                        <div className="team-metric-chart">
                            <Graph options={teamMetricOptions(stepCountAll)} series={buildTeamMetricSeries(renderableAthletes, 'Step Count', teamRangeMeta, teamChartConfig.buckets)} type="line" />
                            {renderAthleteLegend()}
            </div>
          ),
        },
        {
          key: '2',
          label: `Heart Rate`,
          children: (
                        <div className="team-metric-chart">
                            <Graph options={teamMetricOptions(heartRateAll)} series={buildTeamMetricSeries(renderableAthletes, 'Heart Rate', teamRangeMeta, teamChartConfig.buckets)} type="line" />
                            {renderAthleteLegend()}
            </div>
          ),
        },
        {
          key: '3',
          label: `Hrs of Rest`,
          children: (
                        <div className="team-metric-chart">
                            <Graph options={teamMetricOptions(hrsOfSleepAll)} series={buildTeamMetricSeries(renderableAthletes, 'Hrs of Rest', teamRangeMeta, teamChartConfig.buckets)} type="line" />
                            {renderAthleteLegend()}
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
                                onChange={handleRangeViewChange}
                                items={rangeTabs}
                            />
                            {rangeView === '4D' ? (
                                <Timeline 
                                    athletes={renderableAthletes} 
                                    emptyGroups={emptyGroups}
                                    focusRange={focusRange}
                                    setIndex={props.setIndex} 
                                    onEdit={handleEditAthlete}
                                    onDelete={handleDeleteAthlete}
                                    onUpdateDate={handleUpdateGroupDate}
                                    onMoveAthlete={handleMoveAthlete}
                                    onSaveNewGroup={handleSaveNewGroup}
                                    onRemoveEmptyGroup={handleRemoveEmptyGroup}
                                    onDeleteGroup={handleDeleteGroup}
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
                            <Tabs
                                className="team-range-tabs"
                                activeKey={teamRangeView}
                                onChange={setTeamRangeView}
                                items={teamRangeTabs}
                            />
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