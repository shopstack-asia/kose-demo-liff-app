'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from './api_client';

export interface Language {
  code: string;
  name: string;
  flag?: string;
}

export interface Translation {
  code: string;
  translate: Record<string, string>;
}

export interface SettingData {
  languages: Language[];
  translate: Translation[];
  default_language?: string;
}

// Mock language data (fallback when CS API unavailable)
const MOCK_LANGUAGES: Language[] = [
  { code: 'th-TH', name: 'ไทย', flag: '🇹🇭' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
];

// Mock translation dictionary (fallback when CS API unavailable)
const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  'th-TH': {
    'app.name': 'KOSE',
    'login.title': 'เข้าสู่ระบบ',
    'login.subtitle': 'เลือกวิธีเข้าสู่ระบบ',
    'login.email': 'อีเมล',
    'login.phone': 'เบอร์โทรศัพท์',
    'login.google': 'เข้าสู่ระบบด้วย Google',
    'login.apple': 'เข้าสู่ระบบด้วย Apple',
    'login.line': 'เข้าสู่ระบบด้วย LINE',
    'login.email.placeholder': 'กรอกอีเมลของคุณ',
    'login.phone.placeholder': 'กรอกเบอร์โทรศัพท์',
    'login.emailOrPhone.placeholder': 'กรุณากรอกเบอร์โทรศัพท์ หรือ อีเมล์',
    'login.otp.send': 'ส่งรหัส OTP',
    'login.otp.verify': 'ยืนยันรหัส',
    'login.otp.placeholder': 'กรอกรหัส 6 หลัก',
    'login.otp.test.hint': 'สำหรับทดสอบ: ใช้รหัส OTP',
    'login.otp.resend.text': 'ไม่ได้รับรหัส?',
    'login.otp.resend.countdown': 'ส่งใหม่ใน',
    'login.otp.resend.button': 'ส่งใหม่',
    'login.continue': 'ดำเนินการต่อ',
    'login.register.required': 'กรุณากรอกข้อมูลเพิ่มเติมเพื่อสมัครสมาชิก',
    'common.continue': 'ดำเนินการต่อ',
    'common.cancel': 'ยกเลิก',
    'common.loading': 'กำลังโหลด...',
    'common.error': 'เกิดข้อผิดพลาด',
    'common.or': 'หรือ',
  },
  'en-US': {
    'app.name': 'KOSE',
    'login.title': 'Sign In',
    'login.subtitle': 'Choose your sign-in method',
    'login.email': 'Email',
    'login.phone': 'Phone',
    'login.google': 'Sign in with Google',
    'login.apple': 'Sign in with Apple',
    'login.line': 'Sign in with LINE',
    'login.email.placeholder': 'Enter your email',
    'login.phone.placeholder': 'Enter your phone number',
    'login.emailOrPhone.placeholder': 'Please enter your phone number or email',
    'login.otp.send': 'Send OTP',
    'login.otp.verify': 'Verify Code',
    'login.otp.placeholder': 'Enter 6-digit code',
    'login.otp.test.hint': 'For testing: Use OTP code',
    'login.otp.resend.text': "Didn't receive the code?",
    'login.otp.resend.countdown': 'Resend in',
    'login.otp.resend.button': 'Resend',
    'login.continue': 'Continue',
    'login.register.required': 'Please complete your profile to register',
    'common.continue': 'Continue',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.or': 'or',
  },
  'ja-JP': {
    'app.name': 'KOSE',
    'login.title': 'サインイン',
    'login.subtitle': 'サインイン方法を選択',
    'login.email': 'メール',
    'login.phone': '電話',
    'login.google': 'Googleでサインイン',
    'login.apple': 'Appleでサインイン',
    'login.line': 'LINEでサインイン',
    'login.email.placeholder': 'メールアドレスを入力',
    'login.phone.placeholder': '電話番号を入力',
    'login.emailOrPhone.placeholder': '電話番号またはメールアドレスを入力してください',
    'login.otp.send': 'OTPを送信',
    'login.otp.verify': 'コードを確認',
    'login.otp.placeholder': '6桁のコードを入力',
    'login.otp.test.hint': 'テスト用: OTPコード',
    'login.otp.resend.text': 'コードが届かない場合',
    'login.otp.resend.countdown': '再送信まで',
    'login.otp.resend.button': '再送信',
    'login.continue': '続行',
    'login.register.required': '会員登録のため、追加情報を入力してください',
    'common.continue': '続行',
    'common.cancel': 'キャンセル',
    'common.loading': '読み込み中...',
    'common.error': 'エラーが発生しました',
    'common.or': 'または',
  },
  'zh-CN': {
    'app.name': 'KOSE',
    'login.title': '登录',
    'login.subtitle': '选择登录方式',
    'login.email': '邮箱',
    'login.phone': '电话',
    'login.google': '使用 Google 登录',
    'login.apple': '使用 Apple 登录',
    'login.line': '使用 LINE 登录',
    'login.email.placeholder': '输入您的邮箱',
    'login.phone.placeholder': '输入您的电话号码',
    'login.emailOrPhone.placeholder': '请输入您的电话号码或邮箱',
    'login.otp.send': '发送验证码',
    'login.otp.verify': '验证代码',
    'login.otp.placeholder': '输入6位数字代码',
    'login.otp.test.hint': '测试用: 使用OTP代码',
    'login.otp.resend.text': '未收到代码?',
    'login.otp.resend.countdown': '重新发送还需',
    'login.otp.resend.button': '重新发送',
    'login.continue': '继续',
    'login.register.required': '请完成您的个人资料以注册',
    'common.continue': '继续',
    'common.cancel': '取消',
    'common.loading': '加载中...',
    'common.error': '发生错误',
    'common.or': '或',
  },
};

// Language normalization map
const LANGUAGE_NORMALIZATION: Record<string, string> = {
  'th': 'th-TH',
  'en': 'en-US',
  'ja': 'ja-JP',
  'zh': 'zh-CN',
  'th-TH': 'th-TH',
  'en-US': 'en-US',
  'ja-JP': 'ja-JP',
  'zh-CN': 'zh-CN',
};

interface I18nContextType {
  language: string;
  languages: Language[];
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  getTranslation: (langCode: string, key: string) => string;
  normalizeLanguage: (lang: string) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>('');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [defaultLanguage, setDefaultLanguage] = useState<string>('');

  // Normalize language code
  const normalizeLanguage = (lang: string): string => {
    return LANGUAGE_NORMALIZATION[lang] || lang;
  };

  // Load settings from CS API
  useEffect(() => {
    async function loadSettings() {
      try {
        // Get app code from URL or use default
        const urlParams = typeof window !== 'undefined' 
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams();
        const liffAppCode = urlParams.get('app_code') || urlParams.get('code') || 'MOCK';

        const response = await apiClient.get<{
          name: string;
          code: string;
          liff_app_id: string;
          languages: Language[];
          translate: Translation[];
          default_language?: string;
        }>(`/setting/get_setting?code=${liffAppCode}`);

        if (response.success && response.data) {
          const { languages: langs, translate, default_language: defaultLang } = response.data;
          
          // Use CS data
          setLanguages(langs || []);
          setDefaultLanguage(normalizeLanguage(defaultLang || (langs && langs.length > 0 ? langs[0].code : 'th-TH')));

          // Build translation dictionary: { languageCode: { key: value } }
          const translationDict: Record<string, Record<string, string>> = {};
          if (translate) {
            translate.forEach((t) => {
              const normalizedCode = normalizeLanguage(t.code);
              translationDict[normalizedCode] = t.translate || {};
            });
          }
          setTranslations(translationDict);

          // Determine initial language
          let initialLang = normalizeLanguage(defaultLang || (langs && langs.length > 0 ? langs[0].code : 'th-TH'));

          // Check localStorage first
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('preferred_language');
            if (saved) {
              const normalizedSaved = normalizeLanguage(saved);
              if (langs?.some((l) => normalizeLanguage(l.code) === normalizedSaved)) {
                initialLang = normalizedSaved;
              }
            }
          }

          setLanguageState(initialLang);
        } else {
          // Fallback to mock data
          setLanguages(MOCK_LANGUAGES);
          setDefaultLanguage('th-TH');
          setTranslations(MOCK_TRANSLATIONS);
          
          // Check localStorage for saved language
          let initialLang = 'th-TH';
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('preferred_language');
            if (saved) {
              const normalizedSaved = normalizeLanguage(saved);
              if (MOCK_LANGUAGES.some((l) => normalizeLanguage(l.code) === normalizedSaved)) {
                initialLang = normalizedSaved;
              }
            }
          }
          setLanguageState(initialLang);
        }
      } catch (error) {
        console.error('Failed to load language settings:', error);
        // Fallback to mock data
        setLanguages(MOCK_LANGUAGES);
        setDefaultLanguage('th-TH');
        setTranslations(MOCK_TRANSLATIONS);
        
        let initialLang = 'th-TH';
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('preferred_language');
          if (saved) {
            const normalizedSaved = normalizeLanguage(saved);
            if (MOCK_LANGUAGES.some((l) => normalizeLanguage(l.code) === normalizedSaved)) {
              initialLang = normalizedSaved;
            }
          }
        }
        setLanguageState(initialLang);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  const setLanguage = (lang: string) => {
    const normalizedLang = normalizeLanguage(lang);
    // Validate language is in supported list
    const allLanguages = languages.length > 0 ? languages : MOCK_LANGUAGES;
    if (allLanguages.some((l) => normalizeLanguage(l.code) === normalizedLang)) {
      setLanguageState(normalizedLang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred_language', normalizedLang);
      }
    }
  };

  const t = (key: string): string => {
    if (!language) {
      return key;
    }
    const normalizedLang = normalizeLanguage(language);
    const allTranslations = Object.keys(translations).length > 0 ? translations : MOCK_TRANSLATIONS;
    
    // If key exists for selected locale → display translated value
    // If key DOES NOT exist → display the key string itself
    if (allTranslations[normalizedLang] && allTranslations[normalizedLang][key]) {
      return allTranslations[normalizedLang][key];
    }
    return key;
  };

  const getTranslation = (langCode: string, key: string): string => {
    const normalizedLang = normalizeLanguage(langCode);
    const allTranslations = Object.keys(translations).length > 0 ? translations : MOCK_TRANSLATIONS;
    
    // If key exists for locale → display translated value
    // If key DOES NOT exist → display the key string itself
    if (allTranslations[normalizedLang] && allTranslations[normalizedLang][key]) {
      return allTranslations[normalizedLang][key];
    }
    return key;
  };

  return (
    <I18nContext.Provider value={{ language, languages, setLanguage, t, getTranslation, normalizeLanguage, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
