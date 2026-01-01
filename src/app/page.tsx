'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import Image from 'next/image';
import { liff } from '@/lib/liff';
import { apiClient } from '@/lib/api_client';
import { useAuthStatus } from '@/lib/auth_context';
import { LinePermissionPage } from '@/components/layout/line_permission_page';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('กำลังโหลด...');
  const [showPermissionPage, setShowPermissionPage] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const { customerStatus, isLoading: authLoading } = useAuthStatus();

  const handleRetry = () => {
    setLoading(true);
    setShowPermissionPage(false);
    setInitError(null);
    setInitializing(false);
    setMessage('กำลังโหลด...');
    initialize();
  };

  async function initialize() {
    // Prevent multiple simultaneous initializations
    // Set flag IMMEDIATELY before any async operations
    if (initializing) {
      return;
    }
    
    // Set flag IMMEDIATELY to prevent concurrent calls
    setInitializing(true);
    
    try {
      setMessage('กำลังเตรียมระบบ...');
      
      // Check for LINE OAuth callback FIRST (before getting app code)
      let isOAuthCallback = false;
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const oauthCode = urlParams.get('code');
        const oauthState = urlParams.get('state');
        
        // If this is LINE OAuth callback, mark it but let liff.init() handle it
        isOAuthCallback = !!(oauthCode && oauthState === 'login');
      }
      
      // Get LIFF app code from query params or use default
      // IMPORTANT: Skip 'code' param if it's an OAuth callback (use 'app_code' or default)
      const urlParams = new URLSearchParams(window.location.search);
      const liffAppCode = isOAuthCallback 
        ? (urlParams.get('app_code') || 'MOCK')
        : (urlParams.get('app_code') || urlParams.get('code') || 'MOCK');

      // Call get_setting API to get LIFF app ID
      setMessage('กำลังเชื่อมต่อกับระบบ...');
      const settingResponse = await apiClient.get<{
        name: string;
        code: string;
        liff_app_id: string;
      }>(`/setting/get_setting?code=${liffAppCode}`);

      if (!settingResponse.success || !settingResponse.data) {
        console.error('Failed to get setting');
        setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        setLoading(false);
        return;
      }

      const { liff_app_id } = settingResponse.data;

      // Initialize LIFF with app ID from setting
      setMessage('กำลังตรวจสอบสิทธิ์การเข้าถึง...');
      const initResult = await liff.init(liff_app_id);

      if (!initResult.success) {
        // Only redirect if we're not already logged in
        // (OAuth callback might have succeeded in a parallel call)
        if (!liff.isLoggedIn()) {
          setInitializing(false);
          if (initResult.error === 'NOT_IN_LINE') {
            // Not in LINE browser - redirect to LINE login
            await liff.login();
            return;
          }
          if (initResult.error === 'NOT_LOGGED_IN') {
            // LINE browser but not authorized - redirect to LINE login
            await liff.login();
            return;
          }
        }
        setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        setLoading(false);
        setInitializing(false);
        return;
      }

      // Check if logged in and has profile
      if (!liff.isLoggedIn()) {
        setInitializing(false);
        // Not logged in - redirect to LINE login
        await liff.login();
        return;
      }

      const profile = liff.getProfile();
      if (!profile) {
        console.error('Failed to get LINE profile');
        setMessage('ไม่สามารถดึงข้อมูลโปรไฟล์ได้ กรุณาลองอีกครั้ง');
        setLoading(false);
        setInitializing(false);
        return;
      }

      // Call server API to get/create customer
      setMessage('กำลังตรวจสอบสถานะสมาชิก...');
      const response = await apiClient.patch<{
        status: 'new' | 'existing' | 'profile_incomplete' | 'terms_not_accepted';
        customer?: unknown;
      }>('/customer/profile', {
        line_user_id: profile.userId,
        display_name: profile.displayName,
        picture_url: profile.pictureUrl,
      });

      if (!response.success || !response.data) {
        console.error('Failed to get customer status');
        setMessage('เกิดข้อผิดพลาด');
        setLoading(false);
        setInitializing(false);
        return;
      }

      const { status } = response.data;

      // Check if registration data exists in localStorage
      let registrationData = null;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('kose_registration');
          if (stored) {
            registrationData = JSON.parse(stored);
          }
        } catch (error) {
          console.error('Error reading registration data from localStorage:', error);
        }
      }

      // If registration data exists, skip terms/register flow
      if (registrationData && registrationData.success) {
        setMessage('กำลังนำทาง...');
        setLoading(false);
        setInitializing(false);
        router.push('/profile');
        return;
      }

      // Redirect based on status - enforce gated flow
      setMessage('กำลังนำทาง...');
      setLoading(false);
      setInitializing(false);
      switch (status) {
        case 'new':
        case 'terms_not_accepted':
          router.push('/terms');
          break;
        case 'profile_incomplete':
          router.push('/register');
          break;
        case 'existing':
          router.push('/profile');
          break;
        default:
          router.push('/terms');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      setMessage('เกิดข้อผิดพลาดในการโหลด');
      setLoading(false);
      setInitializing(false);
    }
  }

  useEffect(() => {
    // Only initialize once on mount
    if (loading && !initializing) {
      initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect based on auth status once loaded - enforce gated flow
  useEffect(() => {
    if (!authLoading && customerStatus) {
      switch (customerStatus) {
        case 'new':
        case 'terms_not_accepted':
          router.push('/terms');
          break;
        case 'profile_incomplete':
          router.push('/register');
          break;
        case 'existing':
          router.push('/profile');
          break;
      }
    }
  }, [customerStatus, authLoading, router]);

  // Show permission page if LINE authorization needed
  if (showPermissionPage) {
    return <LinePermissionPage onRetry={handleRetry} />;
  }

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
        padding: 20,
        paddingTop: '30vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        <Spin 
          size="large"
        />
        <div style={{ marginTop: 24, color: '#666', fontSize: 16 }}>
          {message}
        </div>
        {initError && (
          <div style={{ marginTop: 16, color: '#ff4d4f', fontSize: 14 }}>
            กรุณาเปิดผ่าน LINE เพื่อใช้งานแอปพลิเคชัน
          </div>
        )}
      </div>
    </div>
  );
}

