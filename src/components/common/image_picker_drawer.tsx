'use client';

import { Drawer } from 'antd';
import { PictureOutlined, CameraOutlined } from '@ant-design/icons';

interface ImagePickerDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectGallery: () => void;
  onSelectCamera: () => void;
}

export function ImagePickerDrawer({
  open,
  onClose,
  onSelectGallery,
  onSelectCamera,
}: ImagePickerDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="auto"
      title="Select Image Source"
      styles={{
        body: { padding: '0' },
        header: { padding: '16px 24px', borderBottom: '1px solid #f0f0f0' },
      }}
      footer={null}
      closeIcon={null}
    >
      <div style={{ padding: '8px 0' }}>
        <button
          onClick={() => {
            onSelectGallery();
            onClose();
          }}
          style={{
            width: '100%',
            padding: '20px 24px',
            border: 'none',
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: 'transparent',
            color: '#333',
            fontSize: '16px',
            fontWeight: 400,
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fafafa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <PictureOutlined style={{ fontSize: '20px', color: '#666' }} />
          <span>Choose from Gallery</span>
        </button>
        
        <button
          onClick={() => {
            onSelectCamera();
            onClose();
          }}
          style={{
            width: '100%',
            padding: '20px 24px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#333',
            fontSize: '16px',
            fontWeight: 400,
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fafafa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <CameraOutlined style={{ fontSize: '20px', color: '#666' }} />
          <span>Take Photo</span>
        </button>
      </div>
    </Drawer>
  );
}


