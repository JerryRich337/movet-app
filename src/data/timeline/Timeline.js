import React, { useState, useEffect } from 'react';
import './Timeline.css';
import { Typography, Row, Col, Badge, Card, Input, Tooltip } from 'antd';
import 'antd/dist/reset.css';
import PatientCard from '../../atoms/patientCard/PatientCard';

const { Title } = Typography;

function Timeline(props) {
  const athletes = props.athletes || [];
  const emptyGroups = props.emptyGroups || [];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const cleanDate = dateString.split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      return `${day}/${month}/${year}`;
    }
    return '';
  };

  // Group athletes dynamically by their insertion date
  const groupedByDate = athletes.reduce((acc, athlete) => {
    const rawDate = athlete.inserted_at ? athlete.inserted_at.split('T')[0] : 'unknown';
    if (!acc[rawDate]) {
      acc[rawDate] = {
        rawDate: rawDate,
        displayDate: formatDate(athlete.inserted_at),
        athletes: []
      };
    }
    acc[rawDate].athletes.push(athlete);
    return acc;
  }, {});

  const athleteColumns = Object.values(groupedByDate);

  const emptyColumns = emptyGroups.map(eg => ({
    rawDate: eg.rawDate,
    displayDate: eg.rawDate ? formatDate(`${eg.rawDate}T00:00:00.000Z`) : '',
    athletes: [],
    isNew: eg.isNew,
    tempId: eg.tempId
  }));

  const allColumns = [...athleteColumns];
  emptyColumns.forEach(ec => {
    const existing = allColumns.find(c => c.rawDate === ec.rawDate && ec.rawDate !== '');
    if (!existing) {
      allColumns.push(ec);
    }
  });

  // Sort columns chronologically (earliest date to latest date)
  allColumns.sort((a, b) => {
    if (!a.rawDate) return 1; // Unsaved/empty groups stay at the end until dated
    if (!b.rawDate) return -1;
    return new Date(a.rawDate) - new Date(b.rawDate);
  });

  return (
    <Row className='timeline'>
      {allColumns.map((col) => (
        <TimelineColumn 
          key={col.tempId || col.rawDate}
          group={col}
          isNewGroup={col.isNew}
          tempId={col.tempId}
          setIndex={props.setIndex}
          onEdit={props.onEdit}
          onDelete={props.onDelete}
          onUpdateDate={props.onUpdateDate}
          onMoveAthlete={props.onMoveAthlete}
          onSaveNewGroup={props.onSaveNewGroup}
          onRemoveEmptyGroup={props.onRemoveEmptyGroup}
        />
      ))}
    </Row>
  );
}

function TimelineColumn({ group, isNewGroup, tempId, setIndex, onEdit, onDelete, onUpdateDate, onMoveAthlete, onSaveNewGroup, onRemoveEmptyGroup }) {
  const [isEditing, setIsEditing] = useState(isNewGroup || false);
  const [inputValue, setInputValue] = useState(group.displayDate || '');
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(group.displayDate || '');
    }
  }, [group.displayDate, isEditing]);

  const validateDate = (str) => {
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = str.match(regex);
    if (!match) return false;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    if (year < 1000 || year > 9999) return false;
    if (month < 1 || month > 12) return false;
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return false;
    return true;
  };

  const handleSave = () => {
    if (validateDate(inputValue)) {
      setIsInvalid(false);
      setIsEditing(false);
      const [day, month, year] = inputValue.split('/');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
      
      if (isNewGroup && onSaveNewGroup) {
        onSaveNewGroup(tempId, `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      } else {
        const athleteIds = group.athletes.map(a => a.id);
        if (onUpdateDate) {
          onUpdateDate(athleteIds, isoDate);
        }
      }
    } else {
      setIsInvalid(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      if (isNewGroup && onRemoveEmptyGroup) {
        onRemoveEmptyGroup(tempId);
      } else {
        setIsEditing(false);
        setInputValue(group.displayDate || '');
        setIsInvalid(false);
      }
    }
  };

  const handleBlur = () => {
    if (isNewGroup && !validateDate(inputValue)) {
      if (onRemoveEmptyGroup) onRemoveEmptyGroup(tempId);
    } else {
      setIsEditing(false);
      setInputValue(group.displayDate || '');
      setIsInvalid(false);
    }
  };

  const handleDropEvent = (e) => {
    e.preventDefault();
    const athleteId = e.dataTransfer.getData('text/plain');
    if (athleteId && onMoveAthlete) {
      onMoveAthlete(athleteId, group.rawDate);
    }
  };

  return (
    <Col 
      className="weeks-group"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropEvent}
    >
      <div className='weeks-group-header'>
        <Tooltip 
          open={isInvalid} 
          title="Accepted format: Day/Month/Year (e.g., 7/8/2026 or 07/08/2026)"
          color="orange"
          placement="top"
        >
          {!isEditing ? (
            <div 
              className="date-header-hover-box"
              onDoubleClick={() => {
                setIsEditing(true);
                setInputValue(group.displayDate || '');
                setIsInvalid(false);
              }}
              style={{ 
                cursor: 'pointer', 
                padding: '2px 6px', 
                borderRadius: '6px', 
                display: 'inline-block', 
                transition: 'all 0.2s' 
              }}
            >
              <Title level={4} style={{ margin: 0, display: 'inline' }}>
                {group.displayDate || 'Select Date'}
              </Title>
            </div>
          ) : (
            <Input 
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (validateDate(e.target.value)) {
                  setIsInvalid(false);
                }
              }}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              autoFocus
              placeholder="d/m/yyyy"
              style={{ 
                width: '120px', 
                borderColor: '#1890ff', 
                boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)' 
              }}
            />
          )}
        </Tooltip>
        <Badge count={group.athletes.length} color='#E53935' />
      </div>
      <Card 
        className='weeks-group-content' 
        bodyStyle={{padding: "4px"}}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropEvent}
      >
        {group.athletes.map(p => (
          <div 
            key={p.id || p.key}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(p.id));
            }}
            style={{ cursor: 'grab', marginBottom: '4px' }}
          >
            <PatientCard 
              className="weeks-group-card"
              athlete={p}
              name={p.name}
              metricData={p.metricData}
              dotColor={p.dotColor}
              cardWidth="100%"
              index={p.key}
              setIndex={setIndex}
              pfTag={p.pfTags && p.pfTags[0]}
              piTag={p.piTags && p.piTags[0]}
              onEdit={onEdit}
              onDelete={onDelete} 
            />
          </div>
        ))}
      </Card>
    </Col>
  );
}

export default Timeline;