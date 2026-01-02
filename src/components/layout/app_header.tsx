'use client';

import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { LanguagePickerDrawer } from '@/components/common/language_picker_drawer';

export function AppHeader() {
  const { language, languages, setLanguage, normalizeLanguage } = useI18n();
  const [isLiffEntry, setIsLiffEntry] = useState<boolean | null>(null); // null = not checked yet
  const [mounted, setMounted] = useState(false);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  // Prevent hydration mismatch by only checking after mount
  useEffect(() => {
    setMounted(true);
    
    const checkLiffEntry = async () => {
      if (typeof window !== 'undefined') {
        const liffObj = (window as any).liff;
        // Only check isInClient() if LIFF SDK is available and initialized
        if (liffObj && typeof liffObj.isInClient === 'function') {
          const isInClient = liffObj.isInClient() === true;
          setIsLiffEntry(isInClient);
        } else {
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

  const currentLanguage = displayLanguages.find(
    (lang) => normalizeLanguage(lang.code) === normalizeLanguage(language)
  ) || displayLanguages[0];

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
      {/* Server renders empty div, client renders button after mount */}
      <div 
        style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}
        suppressHydrationWarning
      >
        {mounted && isLiffEntry === false && (
          <>
            <button
              onClick={() => setLanguagePickerOpen(true)}
              style={{
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.2s',
                color: '#666',
                fontSize: '13px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {currentLanguage?.flag && (
                <span style={{ fontSize: '14px' }}>{currentLanguage.flag}</span>
              )}
              <span>{currentLanguage?.name || 'Language'}</span>
            </button>
            <LanguagePickerDrawer
              open={languagePickerOpen}
              onClose={() => setLanguagePickerOpen(false)}
              value={normalizeLanguage(language)}
              onChange={handleLanguageChange}
              languages={displayLanguages.map((lang) => ({
                code: normalizeLanguage(lang.code),
                name: lang.name,
                flag: lang.flag,
              }))}
            />
          </>
        )}
      </div>
    </div>
  );
}

