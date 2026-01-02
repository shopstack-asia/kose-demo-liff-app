'use client';

import { Drawer } from 'antd';

interface Language {
  code: string;
  name: string;
  flag?: string;
}

interface LanguagePickerDrawerProps {
  open: boolean;
  onClose: () => void;
  value?: string;
  onChange?: (languageCode: string) => void;
  languages: Language[];
}

export function LanguagePickerDrawer({
  open,
  onClose,
  value,
  onChange,
  languages,
}: LanguagePickerDrawerProps) {
  const handleSelect = (languageCode: string) => {
    if (onChange) {
      onChange(languageCode);
    }
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="auto"
      title="Select Language"
      styles={{
        body: { padding: '0' },
        header: { padding: '16px 24px', borderBottom: '1px solid #f0f0f0' },
      }}
      footer={null}
      closeIcon={null}
    >
      <div
        style={{
          padding: '8px 0',
        }}
      >
        {languages.map((lang) => {
          const isSelected = value === lang.code;

          return (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              style={{
                width: '100%',
                padding: '16px 24px',
                border: 'none',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: isSelected ? '#f5f5f5' : 'transparent',
                color: '#333',
                fontSize: '16px',
                fontWeight: isSelected ? 500 : 400,
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
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
              {lang.flag && (
                <span style={{ fontSize: '24px', lineHeight: 1 }}>{lang.flag}</span>
              )}
              <span style={{ flex: 1 }}>{lang.name}</span>
              {isSelected && (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0 }}
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

