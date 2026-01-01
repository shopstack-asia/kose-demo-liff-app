'use client';

import { useState, useEffect } from 'react';
import { Drawer } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

interface DatePickerDrawerProps {
  open: boolean;
  onClose: () => void;
  value?: Dayjs;
  onChange?: (date: Dayjs | null) => void;
  placeholder?: string;
  maxDate?: Dayjs;
  minDate?: Dayjs;
}

type ViewMode = 'day' | 'month' | 'year';

export function DatePickerDrawer({
  open,
  onClose,
  value,
  onChange,
  placeholder = 'Select date',
  maxDate,
  minDate,
}: DatePickerDrawerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(value || null);
  const [viewDate, setViewDate] = useState<Dayjs>(() => {
    if (value && dayjs.isDayjs(value)) return value;
    if (maxDate && dayjs.isDayjs(maxDate)) return maxDate;
    return dayjs();
  });
  const [yearRangeStart, setYearRangeStart] = useState<number>(() => {
    const currentYear = dayjs().year();
    return Math.floor(currentYear / 20) * 20; // Round down to nearest 20
  });

  // Sync value when prop changes
  useEffect(() => {
    if (value && dayjs.isDayjs(value)) {
      setSelectedDate(value);
      setViewDate(value);
    } else {
      setSelectedDate(null);
      if (maxDate && dayjs.isDayjs(maxDate)) {
        setViewDate(maxDate);
      } else {
        setViewDate(dayjs());
      }
    }
  }, [value, maxDate]);

  // Reset view mode when drawer opens
  useEffect(() => {
    if (open) {
      setViewMode('day');
      let targetDate = dayjs();
      if (value && dayjs.isDayjs(value)) {
        targetDate = value;
      } else if (maxDate && dayjs.isDayjs(maxDate)) {
        // Start at maxDate if no value (for DOB, maxDate is usually 13 years ago)
        targetDate = maxDate;
      }
      setViewDate(targetDate);
      
      // Set year range start based on target date
      const targetYear = targetDate.year();
      setYearRangeStart(Math.floor(targetYear / 20) * 20);
    }
  }, [open, value, maxDate]);

  const handleConfirm = () => {
    if (selectedDate && onChange) {
      onChange(selectedDate);
    }
    onClose();
  };

  const handlePrevMonth = () => {
    if (!dayjs.isDayjs(viewDate)) return;
    const newDate = viewDate.subtract(1, 'month');
    if (dayjs.isDayjs(newDate)) {
      setViewDate(newDate);
    }
  };

  const handleNextMonth = () => {
    if (!dayjs.isDayjs(viewDate)) return;
    const newDate = viewDate.add(1, 'month');
    if (dayjs.isDayjs(newDate)) {
      setViewDate(newDate);
    }
  };

  const handlePrevYear = () => {
    if (!dayjs.isDayjs(viewDate)) return;
    const newDate = viewDate.subtract(1, 'year');
    if (dayjs.isDayjs(newDate)) {
      setViewDate(newDate);
    }
  };

  const handleNextYear = () => {
    if (!dayjs.isDayjs(viewDate)) return;
    const newDate = viewDate.add(1, 'year');
    if (dayjs.isDayjs(newDate)) {
      setViewDate(newDate);
    }
  };

  const handleDayClick = (day: number) => {
    if (!dayjs.isDayjs(viewDate)) return;
    const newDate = viewDate.date(day);
    if (!isDateDisabled(day) && dayjs.isDayjs(newDate)) {
      setSelectedDate(newDate);
      setViewDate(newDate);
    }
  };

  const handleMonthClick = (month: number) => {
    if (!dayjs.isDayjs(viewDate)) return;
    const newDate = viewDate.month(month);
    if (dayjs.isDayjs(newDate)) {
      setViewDate(newDate);
      setViewMode('day');
    }
  };

  const handleYearClick = (year: number) => {
    if (!dayjs.isDayjs(viewDate)) return;
    const newDate = viewDate.year(year);
    if (dayjs.isDayjs(newDate)) {
      setViewDate(newDate);
      setViewMode('month');
    }
  };

  const handleMonthTextClick = () => {
    setViewMode('month');
  };

  const handleYearTextClick = () => {
    setViewMode('year');
  };

  // Generate calendar days for current month
  const getCalendarDays = () => {
    if (!dayjs.isDayjs(viewDate)) return [];
    const startOfMonth = viewDate.startOf('month');
    const endOfMonth = viewDate.endOf('month');
    const startDay = startOfMonth.day(); // 0 = Sunday, 6 = Saturday
    const daysInMonth = endOfMonth.date();
    
    const days: (number | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  // Generate years based on yearRangeStart (20 years per range)
  const getYearRange = () => {
    const years: number[] = [];
    for (let year = yearRangeStart; year < yearRangeStart + 20; year++) {
      years.push(year);
    }
    return years;
  };

  const handlePrevYearRange = () => {
    setYearRangeStart(yearRangeStart - 20);
  };

  const handleNextYearRange = () => {
    setYearRangeStart(yearRangeStart + 20);
  };

  const isDateDisabled = (day: number) => {
    if (!dayjs.isDayjs(viewDate)) return true;
    const date = viewDate.date(day);
    if (!dayjs.isDayjs(date)) return true;
    // Check if date is after maxDate (for DOB, maxDate is usually 13 years ago)
    if (maxDate && dayjs.isDayjs(maxDate) && date.isAfter(maxDate, 'day')) return true;
    // Check if date is before minDate
    if (minDate && dayjs.isDayjs(minDate) && date.isBefore(minDate, 'day')) return false;
    // For DOB, disable future dates (dates after today)
    if (!maxDate && date.isAfter(dayjs(), 'day')) return true;
    return false;
  };

  const isSelected = (day: number) => {
    if (!selectedDate || !dayjs.isDayjs(selectedDate) || !dayjs.isDayjs(viewDate)) return false;
    return (
      selectedDate.year() === viewDate.year() &&
      selectedDate.month() === viewDate.month() &&
      selectedDate.date() === day
    );
  };

  const isToday = (day: number) => {
    if (!dayjs.isDayjs(viewDate)) return false;
    const date = viewDate.date(day);
    if (!dayjs.isDayjs(date)) return false;
    return date.isSame(dayjs(), 'day');
  };

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];

  const renderDayView = () => {
    if (!dayjs.isDayjs(viewDate)) {
      return (
        <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
          Loading calendar...
        </div>
      );
    }
    
    const days = getCalendarDays();
    
    return (
      <div>
        {/* Weekday headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '16px',
            padding: '0 8px',
          }}
        >
          {weekdays.map((day) => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 500,
                color: '#666',
                padding: '8px 0',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            padding: '0 8px',
          }}
        >
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} style={{ height: '48px' }} />;
            }

            const disabled = isDateDisabled(day);
            const selected = isSelected(day);
            const today = isToday(day);

            return (
              <button
                key={day}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!disabled) {
                    handleDayClick(day);
                  }
                }}
                style={{
                  height: '48px',
                  width: '100%',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: selected ? '#1f4da1' : 'transparent',
                  color: disabled
                    ? '#ccc'
                    : selected
                    ? '#fff'
                    : today
                    ? '#1f4da1'
                    : '#333',
                  fontSize: '16px',
                  fontWeight: selected ? 600 : 400,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  opacity: disabled ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!disabled && !selected) {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && !selected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    if (!dayjs.isDayjs(viewDate)) return null;
    return (
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            padding: '0 8px',
          }}
        >
          {months.map((month, index) => {
            const isSelectedMonth = viewDate.month() === index;
            
            return (
              <button
                key={month}
                onClick={() => handleMonthClick(index)}
                style={{
                  height: '64px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isSelectedMonth ? '#1f4da1' : 'transparent',
                  color: isSelectedMonth ? '#fff' : '#333',
                  fontSize: '16px',
                  fontWeight: isSelectedMonth ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelectedMonth) {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelectedMonth) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {month}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    if (!dayjs.isDayjs(viewDate)) return null;
    const years = getYearRange();
    const currentYear = viewDate.year();
    
    return (
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            padding: '0 8px',
          }}
        >
          {years.map((year) => {
            const isSelectedYear = currentYear === year;
            
            return (
              <button
                key={year}
                onClick={() => handleYearClick(year)}
                style={{
                  height: '64px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isSelectedYear ? '#1f4da1' : 'transparent',
                  color: isSelectedYear ? '#fff' : '#333',
                  fontSize: '16px',
                  fontWeight: isSelectedYear ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelectedYear) {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelectedYear) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    if (viewMode === 'day') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button
            onClick={handlePrevMonth}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              onClick={handleMonthTextClick}
              style={{
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: '16px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {viewDate.format('MMMM')}
            </span>
            <span
              onClick={handleYearTextClick}
              style={{
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '16px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {viewDate.format('YYYY')}
            </span>
          </div>
          
          <button
            onClick={handleNextMonth}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 12L10 8L6 4"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      );
    } else if (viewMode === 'month') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button
            onClick={handlePrevYear}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          <span style={{ fontWeight: 600, fontSize: '16px' }}>
            {viewDate.format('YYYY')}
          </span>
          
          <button
            onClick={handleNextYear}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 12L10 8L6 4"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      );
    } else {
      // Year view header
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button
            onClick={handlePrevYearRange}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          <span style={{ fontWeight: 600, fontSize: '16px' }}>
            {yearRangeStart} - {yearRangeStart + 19}
          </span>
          
          <button
            onClick={handleNextYearRange}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 12L10 8L6 4"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      );
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="80vh"
      title={renderHeader()}
      styles={{
        body: { padding: '24px' },
        header: { padding: '16px 24px', borderBottom: '1px solid #f0f0f0' },
      }}
      footer={
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={handleConfirm}
            disabled={!selectedDate}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: selectedDate ? '#1f4da1' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: selectedDate ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s',
            }}
          >
            CONFIRM DATE
          </button>
        </div>
      }
      closeIcon={null}
    >
      <div style={{ minHeight: '400px' }}>
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'year' && renderYearView()}
      </div>
    </Drawer>
  );
}
