'use client';

import Image from 'next/image';
import { Select } from 'antd';
import { useI18n } from '@/lib/i18n';
import { useEffect, useState } from 'react';

export function AppHeader() {
  const { language, languages, setLanguage, normalizeLanguage } = useI18n();
  const [isLiffEntry, setIsLiffEntry] = useState<boolean | null>(null); // null = not checked yet
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only checking after mount
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d4ad727a-3953-48f5-8df0-18b7a9d7a25d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app_header.tsx:15',message:'AppHeader useEffect - setting mounted',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'L'})}).catch(()=>{});
    // #endregion
    setMounted(true);
    
    const checkLiffEntry = async () => {
      if (typeof window !== 'undefined') {
        const liffObj = (window as any).liff;
        // Only check isInClient() if LIFF SDK is available and initialized
        if (liffObj && typeof liffObj.isInClient === 'function') {
          const isInClient = liffObj.isInClient() === true;
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/d4ad727a-3953-48f5-8df0-18b7a9d7a25d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app_header.tsx:22',message:'AppHeader - LIFF detected',data:{isInClient},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'L'})}).catch(()=>{});
          // #endregion
          setIsLiffEntry(isInClient);
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/d4ad727a-3953-48f5-8df0-18b7a9d7a25d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app_header.tsx:26',message:'AppHeader - No LIFF, setting false',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'L'})}).catch(()=>{});
          // #endregion
          setIsLiffEntry(false);
        }
      } else {
        setIsLiffEntry(false);
      }
    };
    
    // Small delay to ensure LIFF SDK is initialized
    const timer = setTimeout(checkLiffEntry, 100);
    return () => clearTimeout(timer);
  }, []);

  // Use mock languages if CS API hasn't loaded
  const displayLanguages = languages.length > 0 ? languages : [
    { code: 'th-TH', name: 'ไทย', flag: '🇹🇭' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  ];

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

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
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Logo - Centered */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Image
          src="/kose-logo-h.png"
          alt="KOSE"
          width={120}
          height={36}
          priority
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Language Switcher - Top Right (ONLY for non-LIFF entries) */}
      {/* Use suppressHydrationWarning to prevent hydration mismatch */}
      {/* Server renders empty div, client renders Select after mount */}
      <div 
        style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}
        suppressHydrationWarning
      >
        {mounted && isLiffEntry === false && (
          <Select
            value={normalizeLanguage(language)}
            onChange={handleLanguageChange}
            style={{
              width: 90,
              minWidth: 70,
            }}
            size="small"
            variant="borderless"
            options={displayLanguages.map((lang) => ({
              value: normalizeLanguage(lang.code),
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {lang.flag && <span style={{ fontSize: 14 }}>{lang.flag}</span>}
                  <span style={{ fontSize: 13 }}>{lang.name}</span>
                </span>
              ),
            }))}
            dropdownStyle={{
              borderRadius: 8,
              minWidth: 120,
            }}
            popupMatchSelectWidth={false}
          />
        )}
      </div>
    </div>
  );
}

