'use client';

import { useState } from 'react';
import { Drawer, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { koseStores, Store } from '@/data/stores';

interface StorePickerDrawerProps {
  open: boolean;
  onClose: () => void;
  value?: string;
  onChange?: (storeId: string | null) => void;
}

export function StorePickerDrawer({
  open,
  onClose,
  value,
  onChange,
}: StorePickerDrawerProps) {
  const [searchText, setSearchText] = useState('');

  const filteredStores = koseStores.filter((store) =>
    store.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (storeId: string) => {
    if (onChange) {
      onChange(storeId);
    }
    onClose();
    setSearchText(''); // Reset search when closing
  };

  const handleClose = () => {
    setSearchText(''); // Reset search when closing
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      placement="bottom"
      height="80vh"
      title="Select Store"
      styles={{
        body: { padding: '0' },
        header: { padding: '16px 24px', borderBottom: '1px solid #f0f0f0' },
      }}
      footer={null}
      closeIcon={null}
    >
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Input
          size="large"
          placeholder="Search store..."
          prefix={<SearchOutlined style={{ color: '#999' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <div
        style={{
          maxHeight: 'calc(80vh - 120px)',
          overflowY: 'auto',
          padding: '8px 0',
        }}
      >
        {filteredStores.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              color: '#999',
            }}
          >
            No stores found
          </div>
        ) : (
          filteredStores.map((store) => {
            const isSelected = value === store.id;

            return (
              <button
                key={store.id}
                onClick={() => handleSelect(store.id)}
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
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '4px' }}>{store.name}</div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#999',
                      lineHeight: '1.4',
                    }}
                  >
                    {store.address}
                  </div>
                </div>
                {isSelected && (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ marginLeft: '12px', flexShrink: 0 }}
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
          })
        )}
      </div>
    </Drawer>
  );
}

