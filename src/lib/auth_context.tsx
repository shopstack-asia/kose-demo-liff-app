'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { apiClient } from './api_client';
import { liff } from './liff';

interface AuthStatus {
  isAuthenticated: boolean;
  isLoading: boolean;
  customerStatus?: 'new' | 'existing' | 'profile_incomplete' | 'terms_not_accepted';
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthStatus>({
  isAuthenticated: false,
  isLoading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>({
    isAuthenticated: false,
    isLoading: true,
    refresh: async () => {},
  });

  const checkAuth = useCallback(async () => {
    try {
      // Check localStorage first
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('kose_registration');
          if (stored) {
            const registrationData = JSON.parse(stored);
            if (registrationData && registrationData.customer) {
              // User is registered, set status as existing
              setStatus((prev) => ({
                ...prev,
                isAuthenticated: true,
                isLoading: false,
                customerStatus: 'existing',
              }));
              return;
            }
          }
        } catch (error) {
          console.error('Error reading registration data from localStorage:', error);
        }
      }

      const profile = liff.getProfile();
      if (!profile) {
        setStatus((prev) => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
        }));
        return;
      }

      const response = await apiClient.patch<{
        status: 'new' | 'existing' | 'profile_incomplete' | 'terms_not_accepted';
        customer?: unknown;
      }>('/customer/profile', {
        line_user_id: profile.userId,
      });

      if (response.success && response.data) {
        const customerStatus = response.data.status;
        const isAuthenticated = customerStatus === 'existing';
        setStatus((prev) => ({
          ...prev,
          isAuthenticated,
          isLoading: false,
          customerStatus,
        }));
      } else {
        setStatus((prev) => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setStatus((prev) => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    // Only check if LIFF is initialized
    if (liff.isLoggedIn()) {
      checkAuth();
    } else {
      setStatus((prev) => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  }, [checkAuth]);

  useEffect(() => {
    setStatus((prev) => ({
      ...prev,
      refresh: checkAuth,
    }));
  }, [checkAuth]);

  return <AuthContext.Provider value={status}>{children}</AuthContext.Provider>;
}

export function useAuthStatus() {
  return useContext(AuthContext);
}

