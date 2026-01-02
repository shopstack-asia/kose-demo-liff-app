'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Form, Typography, Divider, message, Spin } from 'antd';
import { MailOutlined, PhoneOutlined, GoogleOutlined, AppleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { OtpInput } from '@/components/common/otp_input';
import { apiClient } from '@/lib/api_client';
import { liff } from '@/lib/liff';

const { Title, Text } = Typography;

type LoginMethod = 'email' | 'phone';

// Splash Screen Component
function SplashScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#faf8f5',
        zIndex: 9999,
      }}
    >
      <div style={{ textAlign: 'center' }}>
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
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { t, language, isLoading: i18nLoading } = useI18n();
  const [form] = Form.useForm();
  const [loginMethod, setLoginMethod] = useState<LoginMethod | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [emailOrPhoneValue, setEmailOrPhoneValue] = useState<string>('');

  // Auto-detect if input is email or phone
  const detectInputType = (value: string): LoginMethod | null => {
    if (!value) return null;
    // Email pattern: contains @ and domain
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return 'email';
    }
    // Phone pattern: digits, spaces, dashes, parentheses, plus sign
    if (/^[\+]?[0-9\s\-\(\)]{7,20}$/.test(value.trim())) {
      return 'phone';
    }
    return null;
  };

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (values: { emailOrPhone?: string }) => {
    const inputValue = values.emailOrPhone?.trim();
    if (!inputValue) {
      message.error(t('login.email.placeholder') || 'login.email.placeholder');
      return;
    }

    const detectedMethod = detectInputType(inputValue);
    if (!detectedMethod) {
      message.error(t('common.error') || 'common.error');
      return;
    }

    setLoginMethod(detectedMethod);
    setEmailOrPhoneValue(inputValue);
    setLoading(true);
    try {
      if (detectedMethod === 'email') {
        const response = await apiClient.post('/customer/verify_email', {
          email: inputValue,
        });
        
        if (response.success) {
          setOtpSent(true);
          setCustomerId(response.data?.customer_id || null);
          setCountdown(60); // Start countdown timer
          message.success(t('login.otp.send') || 'login.otp.send');
        } else {
          message.error(response.error || t('common.error') || 'common.error');
        }
      } else {
        const response = await apiClient.post('/customer/verify_phone', {
          phone: inputValue,
        });
        
        if (response.success) {
          setOtpSent(true);
          setCustomerId(response.data?.customer_id || null);
          setCountdown(60); // Start countdown timer
          message.success(t('login.otp.send') || 'login.otp.send');
        } else {
          message.error(response.error || t('common.error') || 'common.error');
        }
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      message.error(t('common.error') || 'common.error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return; // Prevent resend during countdown
    
    setLoading(true);
    try {
      if (loginMethod === 'email') {
        const response = await apiClient.post('/customer/verify_email', {
          email: emailOrPhoneValue,
        });
        
        if (response.success) {
          setCountdown(60); // Reset countdown timer
          message.success(t('login.otp.send') || 'login.otp.send');
        } else {
          message.error(response.error || t('common.error') || 'common.error');
        }
      } else if (loginMethod === 'phone') {
        const response = await apiClient.post('/customer/verify_phone', {
          phone: emailOrPhoneValue,
        });
        
        if (response.success) {
          setCountdown(60); // Reset countdown timer
          message.success(t('login.otp.send') || 'login.otp.send');
        } else {
          message.error(response.error || t('common.error') || 'common.error');
        }
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      message.error(t('common.error') || 'common.error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    // Use provided otpValue or fallback to state
    const otpToVerify = otpValue || otp;
    
    if (!customerId || otpToVerify.length !== 6 || !loginMethod) {
      message.error(t('login.otp.placeholder') || 'login.otp.placeholder');
      return;
    }

    setLoading(true);
    try {
      const endpoint = loginMethod === 'email' ? '/customer/verify_email' : '/customer/verify_phone';
      const response = await apiClient.post(endpoint, {
        customer_id: customerId,
        otp_code: otpToVerify,
      });

      if (response.success) {
        const preferredLanguage = language;
        const externalId = form.getFieldValue('emailOrPhone');
        
        // Check if customer exists in localStorage first
        let existingRegistration = null;
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('kose_registration');
            if (stored) {
              existingRegistration = JSON.parse(stored);
            }
          } catch (error) {
            console.warn('Failed to read registration data:', error);
          }
        }

        // If customer exists in localStorage, redirect to profile
        const customer = existingRegistration?.customer || existingRegistration?.data?.customer;
        if (customer) {
          message.success(t('login.continue') || 'login.continue');
          router.push('/profile');
          return;
        }

        // No localStorage - redirect to register flow (terms page)
        // Store verified contact info for registration
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('kose_verified_contact', JSON.stringify({
            type: loginMethod,
            value: externalId,
            customer_id: customerId,
          }));
        }
        message.info(t('login.register.required') || 'login.register.required');
        router.push('/terms');
      } else {
        message.error(response.error || t('common.error') || 'common.error');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      message.error(t('common.error') || 'common.error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // TODO: Implement Google OAuth
      // For now, check localStorage and redirect accordingly
      
      // Check localStorage for registration data
      let registrationData = null;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('kose_registration');
          if (stored) {
            registrationData = JSON.parse(stored);
          }
        } catch (error) {
          console.error('Error reading registration data:', error);
        }
      }
      
      // If customer exists in localStorage, redirect to profile
      const customer = registrationData?.customer || registrationData?.data?.customer;
      if (customer) {
        router.push('/profile');
        return;
      }
      
      // No localStorage - redirect to register flow (terms page)
      router.push('/terms');
    } catch (error) {
      console.error('Google login error:', error);
      message.error(t('common.error') || 'common.error');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      // TODO: Implement Apple OAuth
      // For now, check localStorage and redirect accordingly
      
      // Check localStorage for registration data
      let registrationData = null;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('kose_registration');
          if (stored) {
            registrationData = JSON.parse(stored);
          }
        } catch (error) {
          console.error('Error reading registration data:', error);
        }
      }
      
      // If customer exists in localStorage, redirect to profile
      const customer = registrationData?.customer || registrationData?.data?.customer;
      if (customer) {
        router.push('/profile');
        return;
      }
      
      // No localStorage - redirect to register flow (terms page)
      router.push('/terms');
    } catch (error) {
      console.error('Apple login error:', error);
      message.error(t('common.error') || 'common.error');
    } finally {
      setLoading(false);
    }
  };

  const handleLineLogin = async () => {
    try {
      setLoading(true);
      
      // Get LIFF app code from URL params or use default
      const urlParams = typeof window !== 'undefined' 
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
      const liffAppCode = urlParams.get('app_code') || urlParams.get('code') || 'MOCK';
      
      // Get LIFF app ID from settings API
      const settingResponse = await apiClient.get<{
        name: string;
        code: string;
        liff_app_id: string;
        languages: Array<{ code: string; name: string }>;
        default_language?: string;
      }>(`/setting/get_setting?code=${liffAppCode}`);
      
      if (!settingResponse.success || !settingResponse.data) {
        message.error(t('common.error') || 'common.error');
        setLoading(false);
        return;
      }
      
      const { liff_app_id } = settingResponse.data;
      
      // Initialize LIFF
      const initResult = await liff.init(liff_app_id);
      
      if (!initResult.success) {
        // If not logged in, redirect to LINE login
        if (initResult.error === 'NOT_IN_LINE' || initResult.error === 'NOT_LOGGED_IN') {
          await liff.login();
          return;
        }
        message.error(t('common.error') || 'common.error');
        setLoading(false);
        return;
      }
      
      // If already logged in, redirect to profile
      if (liff.isLoggedIn()) {
        const profile = liff.getProfile();
        if (profile) {
          // Update customer status and redirect
          const response = await apiClient.patch<{
            status: 'new' | 'existing' | 'profile_incomplete' | 'terms_not_accepted';
            customer?: unknown;
          }>('/customer/profile', {
            line_user_id: profile.userId,
            display_name: profile.displayName,
            picture_url: profile.pictureUrl,
            preferred_language: language,
          });
          
          if (response.success && response.data) {
            const { status } = response.data;
            
            // Check localStorage for registration data
            let registrationData = null;
            if (typeof window !== 'undefined') {
              try {
                const stored = localStorage.getItem('kose_registration');
                if (stored) {
                  registrationData = JSON.parse(stored);
                }
              } catch (error) {
                console.error('Error reading registration data:', error);
              }
            }
            
            // If customer exists in localStorage, redirect to profile
            const customer = registrationData?.customer || registrationData?.data?.customer;
            if (customer) {
              router.push('/profile');
              return;
            }
            
            // No localStorage - redirect to register flow (terms page)
            router.push('/terms');
          }
        }
      } else {
        // Not logged in, redirect to LINE login
        await liff.login();
      }
    } catch (error) {
      console.error('LINE login error:', error);
      message.error(t('common.error') || 'common.error');
      setLoading(false);
    }
  };

  // Show splash screen while i18n is loading or language is not ready
  // App is ready when: isLoading is false AND language is set
  const appReady = !i18nLoading && !!language;
  
  if (!appReady) {
    return <SplashScreen />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        maxWidth: '400px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <Title level={3} style={{ textAlign: 'center', marginBottom: 8, fontWeight: 600, color: '#2C2C2C' }}>
        {t('login.title') || 'login.title'}
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32, fontSize: 14 }}>
        {t('login.subtitle') || 'login.subtitle'}
      </Text>

      {/* OTP Login - Email/Phone */}
      {!otpSent ? (
        <Form form={form} onFinish={handleSendOtp} layout="vertical">
          <Form.Item
            name="emailOrPhone"
            rules={[
              { required: true, message: t('login.email.placeholder') || 'login.email.placeholder' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const detected = detectInputType(value);
                  if (!detected) {
                    return Promise.reject(new Error(t('common.error') || 'common.error'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              size="large"
              placeholder={t('login.emailOrPhone.placeholder') || 'login.emailOrPhone.placeholder'}
              prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
              style={{
                borderRadius: 12,
                height: 48,
              }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            style={{
              borderRadius: 12,
              height: 48,
              fontWeight: 500,
              background: '#1f4da1',
              borderColor: '#1f4da1',
              marginBottom: 24,
            }}
          >
            {t('login.otp.send') || 'login.otp.send'}
          </Button>
        </Form>
      ) : (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8, color: '#2C2C2C' }}>
              {t('login.otp.verify') || 'login.otp.verify'}
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t('login.otp.placeholder') || 'login.otp.placeholder'}
            </Text>
          </div>

          <div style={{ marginBottom: 24 }}>
            <OtpInput onChange={setOtp} onComplete={handleVerifyOtp} />
          </div>

          {/* Test OTP Hint */}
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12, marginBottom: 16, color: '#999' }}>
            {t('login.otp.test.hint') || 'login.otp.test.hint'} <strong style={{ color: '#1f4da1' }}>999999</strong>
          </Text>

          {/* Resend OTP */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t('login.otp.resend.text') || 'login.otp.resend.text'}{' '}
              {countdown > 0 ? (
                <span>{t('login.otp.resend.countdown') || 'login.otp.resend.countdown'} {countdown}s</span>
              ) : (
                <Button
                  type="link"
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={{ padding: 0, height: 'auto', fontSize: 13 }}
                >
                  {t('login.otp.resend.button') || 'login.otp.resend.button'}
                </Button>
              )}
            </Text>
          </div>

          <Button
            type="primary"
            block
            size="large"
            onClick={handleVerifyOtp}
            loading={loading}
            disabled={otp.length !== 6}
            style={{
              borderRadius: 12,
              height: 48,
              fontWeight: 500,
              background: otp.length === 6 ? '#1f4da1' : '#d9d9d9',
              borderColor: otp.length === 6 ? '#1f4da1' : '#d9d9d9',
              marginBottom: 12,
            }}
            className={otp.length === 6 ? 'verify-otp-enabled' : ''}
          >
            <span style={{ color: otp.length === 6 ? '#ffffff' : 'rgba(0, 0, 0, 0.25)' }}>
              {t('login.otp.verify') || 'login.otp.verify'}
            </span>
          </Button>

          <Button
            block
            onClick={() => {
              setOtpSent(false);
              setOtp('');
              setLoginMethod(null);
              form.resetFields();
            }}
            style={{
              borderRadius: 12,
              height: 48,
            }}
          >
            {t('common.cancel') || 'common.cancel'}
          </Button>
        </div>
      )}

      {/* Social Login - Only show when OTP not sent */}
      {!otpSent && (
        <>
          {/* Divider */}
          <Divider plain style={{ margin: '32px 0 24px 0' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t('common.or') || 'common.or'}
            </Text>
          </Divider>

          {/* Social Login - LINE, Google & Apple */}
          <div>
            <Button
              block
              size="large"
              onClick={handleLineLogin}
              loading={loading}
              style={{
            borderRadius: 12,
            height: 48,
            fontWeight: 500,
            background: '#06C755',
            borderColor: '#06C755',
            color: '#ffffff',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.63.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.086.768.063 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"
              fill="currentColor"
            />
          </svg>
          {t('login.line') || 'login.line'}
        </Button>

        <Button
          block
          size="large"
          onClick={handleGoogleLogin}
          style={{
            borderRadius: 12,
            height: 48,
            fontWeight: 500,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {t('login.google') || 'login.google'}
        </Button>

        <Button
          block
          size="large"
          onClick={handleAppleLogin}
          style={{
            borderRadius: 12,
            height: 48,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
              fill="#000000"
            />
          </svg>
          {t('login.apple') || 'login.apple'}
        </Button>
          </div>
        </>
      )}
    </div>
  );
}

