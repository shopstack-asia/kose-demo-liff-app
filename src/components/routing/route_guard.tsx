'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin } from 'antd';
import Image from 'next/image';
import { liff } from '@/lib/liff';
import { apiClient } from '@/lib/api_client';
import { getTargetPage, setTargetPage } from '@/lib/redirect_utils';

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

  useEffect(() => {
    async function checkAuth() {
      if (typeof window === 'undefined') {
        setChecking(false);
        return;
      }

      try {
        // STEP 1: Check localStorage
        const stored = localStorage.getItem('kose_registration');
        let hasLocalStorage = false;
        if (stored) {
          try {
            const registrationData = JSON.parse(stored);
            const customer = registrationData?.customer || registrationData?.data?.customer;
            if (customer) {
              hasLocalStorage = true;
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

        // Call get_setting API to get LIFF app ID with timeout
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('API timeout')), 10000); // 10 seconds timeout
        });

        const settingResponse = await Promise.race([
          apiClient.get<{
            name: string;
            code: string;
            liff_app_id: string;
            languages: Array<{ code: string; name: string }>;
            default_language?: string;
          }>(`/setting/get_setting?code=${liffAppCode}`),
          timeoutPromise,
        ]) as Awaited<ReturnType<typeof apiClient.get<{
          name: string;
          code: string;
          liff_app_id: string;
          languages: Array<{ code: string; name: string }>;
          default_language?: string;
        }>>>;

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
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';

      // Check user agent for LINE browser
      const isLineUserAgent = userAgent.includes('Line/') || userAgent.includes('LINE/');
      
      // Wait for window.liff to be injected (max 5 seconds)
      let liffObj = (window as any).liff;
      let waitCount = 0;
      const maxWait = 1; // 1 * 100ms = 1 seconds

      while (!liffObj && waitCount < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 100));
        liffObj = (window as any).liff;
        waitCount++;
      }

      if (liffObj) {
        // Try to initialize LIFF to check if in LINE browser
        try {
          // Wait for LIFF SDK to be fully ready before checking isInClient
          // Sometimes isInClient() is not available immediately after window.liff appears
          let isInClientAvailable = typeof liffObj.isInClient === 'function';
          let waitForIsInClient = 0;
          const maxWaitForIsInClient = 20; // 2 seconds
          
          while (!isInClientAvailable && waitForIsInClient < maxWaitForIsInClient) {
            await new Promise(resolve => setTimeout(resolve, 100));
            isInClientAvailable = typeof liffObj.isInClient === 'function';
            waitForIsInClient++;
          }

          const initResult = await liff.init(liff_app_id);
          
          if (initResult.success) {
            if (isInClientAvailable) {
              const isInClientResult = liffObj.isInClient();
              isLineBrowser = isInClientResult === true;
            } else {
              // If window.liff exists but isInClient is still not available after waiting, assume LINE Browser
              isLineBrowser = true;
            }
            liffLoggedIn = liff.isLoggedIn();
          } else {
            // If init fails with NOT_IN_LINE, it's definitely not a LINE browser
            if (initResult.error === 'NOT_IN_LINE') {
              isLineBrowser = false;
            } else if (hasLiffLineMe || hasLiffId || isLineUserAgent) {
              // Only assume LINE browser if URL patterns or user agent match AND error is not NOT_IN_LINE
              isLineBrowser = true;
            }
          }
        } catch (error) {
          // If init throws error, check URL patterns and user agent
          if (hasLiffLineMe || hasLiffId || isLineUserAgent) {
            isLineBrowser = true;
          }
        }
      } else if (hasLiffLineMe || hasLiffId || isLineUserAgent) {
        isLineBrowser = true;
      }

      // STEP 3: Initialize LIFF and check login status
      // Initialize LIFF if not already done
      if (!liffObj) {
        const initResult = await liff.init(liff_app_id);
        if (!initResult.success && !liff.isLoggedIn()) {
          if (initResult.error === 'NOT_IN_LINE') {
            // NOT_IN_LINE means not in LINE browser - redirect to language/login
            const savedLang = localStorage.getItem('preferred_language');
            const redirectPath = savedLang ? '/login' : '/language';
            router.replace(redirectPath);
            setChecking(false);
            return;
          } else if (initResult.error === 'NOT_LOGGED_IN') {
            // NOT_LOGGED_IN means in LINE browser but not logged in - call login
            if (isLineBrowser) {
              await liff.login();
              return;
            } else {
              // Not LINE browser and not logged in - redirect to login
              const savedLang = localStorage.getItem('preferred_language');
              const redirectPath = savedLang ? '/login' : '/language';
              router.replace(redirectPath);
              setChecking(false);
              return;
            }
          }
        }
      }

      // STEP 4: Check if user is logged in via LIFF (either LINE browser or web OAuth)
      const isLiffLoggedIn = liff.isLoggedIn();
      
      if (isLiffLoggedIn) {
        // User is logged in via LIFF (LINE browser or web OAuth)
        // Check for target page first
        const targetPage = getTargetPage();
        
        if (targetPage) {
          // Preserve target page - will redirect after terms/register flow
          setTargetPage(targetPage);
        }
        
        router.replace('/terms');
        return;
      } else if (isLineBrowser) {
        // LINE Browser but not logged in - call login
        // Preserve target page if exists
        const targetPage = getTargetPage();
        if (targetPage) {
          setTargetPage(targetPage);
        }
        await liff.login();
        return;
      } else {
        // NOT LINE Browser and not logged in → Redirect to language or login
        // Preserve target page if exists
        const targetPage = getTargetPage();
        if (targetPage) {
          setTargetPage(targetPage);
        }
        const savedLang = localStorage.getItem('preferred_language');
        const redirectPath = savedLang ? '/login' : '/language';
        router.replace(redirectPath);
        return;
      }
      } catch (error) {
        console.error('checkAuth error:', error);
        setChecking(false);
      }
    }

    checkAuth();
  }, [router, pathname]);

  // Show loading screen while checking
  if (checking) {
    return (
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
    );
  }

  // Allow access - render children
  return <>{children}</>;
}

