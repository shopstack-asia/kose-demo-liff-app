'use client';

import { Spin } from 'antd';
import Image from 'next/image';

export function LoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        minHeight: '100vh',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: '35vh',
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <Image
          src="/kose-logo-h.png"
          alt="KOSE"
          width={200}
          height={60}
          priority
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      <Spin size="large" />
    </div>
  );
}

