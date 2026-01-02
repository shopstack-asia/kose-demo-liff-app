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
      // Check localStorage first (for OTP login users)
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('kose_registration');
          
          if (stored) {
            const registrationData = JSON.parse(stored);
            // Check if registration data exists and has customer object
            // Support both formats: { customer: {...} } and { success: true, data: { customer: {...} } }
            const customer = registrationData?.customer || registrationData?.data?.customer;
            if (customer) {
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

      // If no localStorage data, check LIFF profile (for LINE users)
      const profile = liff.getProfile();
      
      if (!profile) {
        // No LIFF profile and no localStorage data - user not authenticated
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
    // Always check auth - it will check localStorage first (for OTP users)
    // and then check LIFF profile (for LINE users)
    checkAuth();
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

