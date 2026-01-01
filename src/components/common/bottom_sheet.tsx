'use client';

import { Drawer, Button } from 'antd';
import { ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  loading?: boolean;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  confirmText = 'Confirm',
  onConfirm,
  loading = false,
}: BottomSheetProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="auto"
      title={title}
      styles={{
        body: { padding: '24px' },
        header: { padding: '16px 24px' },
      }}
      footer={
        footer || (
          <div style={{ padding: '16px 24px', display: 'flex', gap: 12 }}>
            <Button block onClick={onClose} size="large">
              Cancel
            </Button>
            {onConfirm && (
              <Button
                block
                type="primary"
                onClick={onConfirm}
                size="large"
                loading={loading}
              >
                {confirmText}
              </Button>
            )}
          </div>
        )
      }
    >
      {children}
    </Drawer>
  );
}

