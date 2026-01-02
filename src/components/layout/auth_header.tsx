'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function AuthHeader() {
  const pathname = usePathname();
  
  // Hide language switcher on login page and language selection page
  const hideLanguageSwitcher = pathname === '/login' || pathname === '/language';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Image
        src="/kose-logo-h.png"
        alt="KOSE"
        width={120}
        height={36}
        priority
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}

