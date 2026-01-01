'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app_layout';
import { useAuthStatus } from '@/lib/auth_context';
import { LoadingScreen } from '@/components/layout/loading_screen';

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading, customerStatus } = useAuthStatus();

  useEffect(() => {
    if (!isLoading) {
      // Check if registration data exists in localStorage first
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

      // If registration data exists, skip redirect (user is registered)
      if (registrationData && registrationData.customer) {
        return; // Allow access to app pages
      }

      // Redirect if terms not accepted
      if (customerStatus === 'new' || customerStatus === 'terms_not_accepted') {
        router.push('/terms');
        return;
      }
      
      // Redirect if profile incomplete
      if (customerStatus === 'profile_incomplete') {
        router.push('/register');
        return;
      }
    }
  }, [isLoading, customerStatus, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check localStorage before redirecting
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

  // If registration data exists, allow access
  if (registrationData && registrationData.customer) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Guard: redirect if not authenticated
  if (customerStatus === 'new' || customerStatus === 'terms_not_accepted' || customerStatus === 'profile_incomplete') {
    return <LoadingScreen />;
  }

  return <AppLayout>{children}</AppLayout>;
}

