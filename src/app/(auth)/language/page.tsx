'use client';

import { useRouter } from 'next/navigation';
import { Button, Spin } from 'antd';
import { useI18n } from '@/lib/i18n';
import Image from 'next/image';

export default function LanguageSelectionPage() {
  const router = useRouter();
  const { languages, setLanguage, isLoading } = useI18n();

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode);
    router.push('/login');
  };

  // Use mock languages if CS API hasn't loaded
  const displayLanguages = languages.length > 0 ? languages : [
    { code: 'th-TH', name: 'ไทย', flag: '🇹🇭' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  ];

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '24px',
          background: 'linear-gradient(135deg, #e8f0f8 0%, #d4e4f0 50%, #c0d8e8 100%)',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '32px 24px',
        background: 'linear-gradient(135deg, #e8f0f8 0%, #d4e4f0 50%, #c0d8e8 100%)',
        position: 'relative',
      }}
    >
      {/* Logo ONLY - No title, no instructional text */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{ marginBottom: 48 }}>
          <Image
            src="/kose-logo-h.png"
            alt="KOSE"
            width={180}
            height={54}
            priority
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Language Options - Native labels only */}
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {displayLanguages.map((lang) => (
          <Button
            key={lang.code}
            size="large"
            block
            onClick={() => handleLanguageSelect(lang.code)}
            style={{
              height: '72px',
              fontSize: '18px',
              fontWeight: 400,
              borderRadius: '16px',
              background: '#ffffff',
              border: 'none',
              color: '#1f4da1',
              boxShadow: '0 2px 12px rgba(31, 77, 161, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(31, 77, 161, 0.18)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(31, 77, 161, 0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 8px rgba(31, 77, 161, 0.15)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(31, 77, 161, 0.18)';
            }}
          >
            {lang.flag && (
              <span style={{ fontSize: '28px', lineHeight: 1 }}>{lang.flag}</span>
            )}
            <span style={{ fontSize: '18px', fontWeight: 400 }}>{lang.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
