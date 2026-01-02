'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin } from 'antd';
import Image from 'next/image';
import { liff } from '@/lib/liff';
import { apiClient } from '@/lib/api_client';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * RouteGuard - Single source of truth for protected route authentication
 * 
 * Protected routes: /home, /purchase, /coupon, /profile
 * 
 * Logic:
 * 1. If hasLocalStorage (kose_registration) → allow access
 * 2. If !hasLocalStorage:
 *    - If LINE browser → LINE permission flow → redirect to /terms
 *    - If !LINE browser → redirect to /language or /login
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState<{
    pathname: string;
    hasLocalStorage: boolean;
    isLineBrowser: boolean | null;
    liffLoggedIn: boolean | null;
    redirectTarget: string | null;
  }>({
    pathname: '',
    hasLocalStorage: false,
    isLineBrowser: null,
    liffLoggedIn: null,
    redirectTarget: null,
  });

  useEffect(() => {
    async function checkAuth() {
      if (typeof window === 'undefined') {
        setChecking(false);
        return;
      }

      // STEP 1: Check localStorage
      const stored = localStorage.getItem('kose_registration');
      let hasLocalStorage = false;
      if (stored) {
        try {
          const registrationData = JSON.parse(stored);
          const customer = registrationData?.customer || registrationData?.data?.customer;
          if (customer) {
            hasLocalStorage = true;
            setDebugInfo({
              pathname,
              hasLocalStorage: true,
              isLineBrowser: null,
              liffLoggedIn: null,
              redirectTarget: null,
            });
            setChecking(false);
            return;
          }
        } catch (error) {
          console.error('Error parsing localStorage:', error);
        }
      }

      // STEP 2: No localStorage - check LINE browser
      // Get LIFF app code from query params or use default
      const urlParams = new URLSearchParams(window.location.search);
      const liffAppCode = urlParams.get('app_code') || urlParams.get('code') || 'MOCK';

      // Call get_setting API to get LIFF app ID
      const settingResponse = await apiClient.get<{
        name: string;
        code: string;
        liff_app_id: string;
        languages: Array<{ code: string; name: string }>;
        default_language?: string;
      }>(`/setting/get_setting?code=${liffAppCode}`);

      if (!settingResponse.success || !settingResponse.data) {
        console.error('Failed to get setting');
        setChecking(false);
        return;
      }

      const { liff_app_id } = settingResponse.data;

      // Detect LINE Browser
      let isLineBrowser = false;
      let liffLoggedIn = false;

      const currentUrl = window.location.href;
      const hasLiffLineMe = currentUrl.includes('liff.line.me');
      const hasLiffId = urlParams.has('liffId') || urlParams.has('liff.id');

      // Wait for window.liff to be injected (max 2 seconds)
      let liffObj = (window as any).liff;
      let waitCount = 0;
      const maxWait = 20; // 20 * 100ms = 2 seconds

      while (!liffObj && waitCount < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 100));
        liffObj = (window as any).liff;
        waitCount++;
      }

      if (liffObj) {
        // Try to initialize LIFF to check if in LINE browser
        try {
          const initResult = await liff.init(liff_app_id);
          if (initResult.success) {
            if (typeof liffObj.isInClient === 'function') {
              isLineBrowser = liffObj.isInClient() === true;
            } else {
              isLineBrowser = true; // Assume LINE Browser if window.liff exists
            }
            liffLoggedIn = liff.isLoggedIn();
          } else {
            // If init fails, check URL patterns
            if (hasLiffLineMe || hasLiffId) {
              isLineBrowser = true;
            }
          }
        } catch (error) {
          // If init throws error, check URL patterns
          if (hasLiffLineMe || hasLiffId) {
            isLineBrowser = true;
          }
        }
      } else if (hasLiffLineMe || hasLiffId) {
        isLineBrowser = true;
      }

      // STEP 3: Redirect based on LINE browser detection
      if (isLineBrowser) {
        // LINE Browser → Initialize LIFF and redirect to terms
        // Initialize LIFF if not already done
        if (!liffObj) {
          const initResult = await liff.init(liff_app_id);
          if (!initResult.success && !liff.isLoggedIn()) {
            if (initResult.error === 'NOT_IN_LINE' || initResult.error === 'NOT_LOGGED_IN') {
              setDebugInfo({
                pathname,
                hasLocalStorage: false,
                isLineBrowser: true,
                liffLoggedIn: false,
                redirectTarget: '/terms',
              });
              await liff.login();
              return;
            }
          }
        }

        // Check if logged in
        if (!liff.isLoggedIn()) {
          setDebugInfo({
            pathname,
            hasLocalStorage: false,
            isLineBrowser: true,
            liffLoggedIn: false,
            redirectTarget: '/terms',
          });
          await liff.login();
          return;
        }

        setDebugInfo({
          pathname,
          hasLocalStorage: false,
          isLineBrowser: true,
          liffLoggedIn: true,
          redirectTarget: '/terms',
        });
        router.replace('/terms');
        return;
      } else {
        // NOT LINE Browser → Redirect to language or login
        const savedLang = localStorage.getItem('preferred_language');
        const redirectPath = savedLang ? '/login' : '/language';

        setDebugInfo({
          pathname,
          hasLocalStorage: false,
          isLineBrowser: false,
          liffLoggedIn: null,
          redirectTarget: redirectPath,
        });
        router.replace(redirectPath);
        return;
      }
    }

    checkAuth();
  }, [router, pathname]);

  // Show loading screen while checking
  if (checking) {
    return (
      <>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            height: '100vh',
            backgroundColor: '#f5f5f5',
            padding: 20,
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
            <Spin size="large" />
          </div>
        </div>
      </>
    );
  }

  // Allow access - render children
  return <>{children}</>;
}

