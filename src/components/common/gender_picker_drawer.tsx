'use client';

import { Drawer } from 'antd';

interface GenderPickerDrawerProps {
  open: boolean;
  onClose: () => void;
  value?: 'male' | 'female' | 'other';
  onChange?: (value: 'male' | 'female' | 'other' | null) => void;
}

const genderOptions: Array<{ value: 'male' | 'female' | 'other'; label: string }> = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export function GenderPickerDrawer({
  open,
  onClose,
  value,
  onChange,
}: GenderPickerDrawerProps) {
  const handleSelect = (selectedValue: 'male' | 'female' | 'other') => {
    if (onChange) {
      onChange(selectedValue);
    }
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="auto"
      title="Select Gender"
      styles={{
        body: { padding: '0' },
        header: { padding: '16px 24px', borderBottom: '1px solid #f0f0f0' },
      }}
      footer={null}
      closeIcon={null}
    >
      <div style={{ padding: '8px 0' }}>
        {genderOptions.map((option, index) => {
          const isSelected = value === option.value;
          const isLast = index === genderOptions.length - 1;
          
          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              style={{
                width: '100%',
                padding: '16px 24px',
                border: 'none',
                borderBottom: isLast ? 'none' : '1px solid #f0f0f0',
                backgroundColor: isSelected ? '#f5f5f5' : 'transparent',
                color: '#333',
                fontSize: '16px',
                fontWeight: isSelected ? 500 : 400,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#fafafa';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{option.label}</span>
              {isSelected && (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.667 5L7.5 14.167L3.333 10"
                    stroke="#1f4da1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </Drawer>
  );
}

