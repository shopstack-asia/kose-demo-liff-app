'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { liff } from '@/lib/liff';
import { getTargetPage, setTargetPage, validatePagePath, clearTargetPage } from '@/lib/redirect_utils';

/**
 * Root Page - Handles query-based redirect after LIFF init
 * 
 * Flow:
 * 1. Read ?page= query param from URL
 * 2. Store target page in sessionStorage
 * 3. Wait for LIFF init (if needed)
 * 4. Redirect to target page or default to /home
 */
export default function RootPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function handleRedirect() {
      if (typeof window === 'undefined') return;
      
      // IMPORTANT: Read page query param FIRST before any other logic
      // This ensures we capture the target page even if RouteGuard redirects
      const urlParams = new URLSearchParams(window.location.search);
      let pageParam = urlParams.get('page');
      
      // LIFF may pass query params via liff.state parameter
      // Format: ?liff.state=%3Fpage%3Dpurchase (URL encoded ?page=purchase)
      if (!pageParam) {
        const liffState = urlParams.get('liff.state');
        if (liffState) {
          try {
            // Decode the state parameter
            const decodedState = decodeURIComponent(liffState);
            
            // Parse the decoded state as URL search params
            // liff.state may contain: "?page=purchase" or "page=purchase"
            const stateStr = decodedState.startsWith('?') ? decodedState.substring(1) : decodedState;
            const stateParams = new URLSearchParams(stateStr);
            pageParam = stateParams.get('page');
          } catch (error) {
            // Failed to parse liff.state, ignore
          }
        }
      }
      
      // If not in query params, check hash fragment
      if (!pageParam && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        pageParam = hashParams.get('page');
      }
      
      // Also check if page param is in referrer (LIFF may have redirected)
      if (!pageParam && document.referrer) {
        try {
          const referrerUrl = new URL(document.referrer);
          const referrerParams = new URLSearchParams(referrerUrl.search);
          pageParam = referrerParams.get('page');
        } catch (error) {
          // Invalid referrer URL, ignore
        }
      }
      
      // Also check sessionStorage (LIFF init may have preserved it)
      if (!pageParam && typeof window !== 'undefined') {
        try {
          const preservedPageParam = sessionStorage.getItem('kose_liff_page_param');
          if (preservedPageParam) {
            pageParam = preservedPageParam;
            // Clear after reading
            sessionStorage.removeItem('kose_liff_page_param');
          }
        } catch (error) {
          // Failed to read preserved page param, ignore
        }
      }
      
      // Validate and store target page immediately
      if (pageParam) {
        const validatedPath = validatePagePath(pageParam);
        if (validatedPath) {
          setTargetPage(validatedPath);
        }
      }
      
      // Check for OAuth callback (LINE login redirect)
      const oauthCode = urlParams.get('code');
      const oauthState = urlParams.get('state');
      
      // If we have OAuth callback, initialize LIFF first to process the callback
      if (oauthCode) {
        // Get LIFF app ID from settings if not already stored
        let liffAppId = liff.getLiffAppId();
        if (!liffAppId) {
          const liffAppCode = urlParams.get('app_code') || 'MOCK';
          try {
            const { apiClient } = await import('@/lib/api_client');
            const settingResponse = await apiClient.get<{
              liff_app_id: string;
            }>(`/setting/get_setting?code=${liffAppCode}`);
            if (settingResponse.success && settingResponse.data) {
              liffAppId = settingResponse.data.liff_app_id;
            }
          } catch (error) {
            console.error('Failed to get LIFF app ID:', error);
          }
        }
        
        // Initialize LIFF to process OAuth callback
        if (liffAppId) {
          const initResult = await liff.init(liffAppId);
          if (initResult.success && liff.isLoggedIn()) {
            // OAuth callback processed successfully
            // Get target page before redirecting
            const targetPage = getTargetPage();
            // Clean up URL - preserve page param if exists
            const cleanUrl = targetPage ? `/?page=${pageParam}` : '/';
            window.history.replaceState({}, '', cleanUrl);
            
            if (targetPage) {
              // Redirect to target page after OAuth
              clearTargetPage();
              router.replace(targetPage);
              return;
            } else {
              // No target page, redirect to home (RouteGuard will handle /terms redirect)
              router.replace('/home');
              return;
            }
          }
        }
      }
      
      // Get stored target page (from query or previous session)
      const targetPage = getTargetPage();
      
      // If we have a target page, ensure LIFF is initialized
      if (targetPage) {
        // Check if LIFF is already initialized
        if (liff.isLoggedIn()) {
          // LIFF already initialized, redirect immediately
          clearTargetPage();
          router.replace(targetPage);
          return;
        }
        
        // Try to initialize LIFF if we have app ID
        // Extract LIFF app ID from URL if available (format: liff.line.me/{LIFF_APP_ID})
        let liffAppId = liff.getLiffAppId();
        
        // If no app ID stored, try to get from settings API
        if (!liffAppId) {
          const liffAppCode = urlParams.get('app_code') || 'MOCK';
          try {
            const { apiClient } = await import('@/lib/api_client');
            const settingResponse = await apiClient.get<{
              liff_app_id: string;
            }>(`/setting/get_setting?code=${liffAppCode}`);
            if (settingResponse.success && settingResponse.data) {
              liffAppId = settingResponse.data.liff_app_id;
            }
          } catch (error) {
            // Failed to get LIFF app ID, ignore
          }
        }
        
        if (liffAppId) {
          const initResult = await liff.init(liffAppId);
          
          if (initResult.success && liff.isLoggedIn()) {
            clearTargetPage();
            router.replace(targetPage);
            return;
          }
          // Even if init failed, if we have target page, let RouteGuard handle it
          // RouteGuard will preserve target page and redirect after auth
        }
        // No LIFF app ID - RouteGuard will handle initialization
      }
      
      // Default redirect to /home
      // If no target page or LIFF init failed, go to home
      // RouteGuard will handle authentication flow and check for target page
      if (pathname === '/' || pathname === '') {
        router.replace('/home');
      }
      
      setInitialized(true);
    }

    handleRedirect();
  }, [pathname, router]);

  // Don't render anything - just redirect
  return null;
}
