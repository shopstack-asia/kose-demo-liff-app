'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Typography, message, Spin } from 'antd';
import { PageHeader } from '@/components/layout/page_header';
import { OtpInput } from '@/components/common/otp_input';
import { apiClient } from '@/lib/api_client';

const { Paragraph } = Typography;

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customer_id');
  const isEdit = searchParams.get('edit') === 'true'; // Check if this is edit flow
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  const [hasEmail, setHasEmail] = useState(true);

  useEffect(() => {
    // Check if customer has email
    // Mock: In production, fetch customer data
    // For now, assume email exists
  }, []);

  const handleVerify = async () => {
    if (!customerId || otp.length !== 6) {
      message.error('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const verifyResponse = await apiClient.post('/customer/verify_email', {
        customer_id: customerId,
        otp_code: otp,
      });

      if (verifyResponse.success) {
        message.success('Email verified successfully');
        
        // Handle edit flow
        if (isEdit) {
          // Load pending updates from sessionStorage
          let pendingUpdates = null;
          if (typeof window !== 'undefined') {
            try {
              const stored = sessionStorage.getItem('kose_pending_profile_update');
              if (stored) {
                pendingUpdates = JSON.parse(stored);
              }
            } catch (error) {
              console.warn('Failed to load pending updates:', error);
            }
          }

          if (pendingUpdates) {
            try {
              const updateResponse = await apiClient.patch('/customer/update_profile', {
                customer_id: pendingUpdates.customer_id,
                line_user_id: pendingUpdates.line_id,
                first_name: pendingUpdates.first_name,
                last_name: pendingUpdates.last_name,
                phone: pendingUpdates.phone,
                email: pendingUpdates.email,
                line_id: pendingUpdates.line_id,
                dob: pendingUpdates.dob,
                gender: pendingUpdates.gender,
                image_url: pendingUpdates.image_url,
              });

              if (updateResponse.success) {
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('kose_pending_profile_update');
                }
                message.success('Profile updated successfully');
                router.push('/profile');
                return;
              } else {
                message.error('Failed to update profile');
                return;
              }
            } catch (error) {
              console.error('Update profile error:', error);
              message.error('Failed to update profile');
              return;
            }
          }
        }
        
        // Registration flow (original logic)
        // Call register API after verification
        // Get line_user_id from sessionStorage
        let lineUserId = null;
        if (typeof window !== 'undefined') {
          try {
            const savedProfile = sessionStorage.getItem('kose_liff_profile');
            if (savedProfile) {
              const profile = JSON.parse(savedProfile);
              lineUserId = profile.userId;
            }
          } catch (error) {
            console.warn('Failed to load profile from sessionStorage:', error);
          }
        }
        
        try {
          const registerResponse = await apiClient.post('/customer/register', {
            customer_id: customerId,
            line_user_id: lineUserId,
          });

          console.log('Register response:', registerResponse);

          if (registerResponse.success) {
            // Store registration data in localStorage
            // API returns { success: true, data: { customer: {...} } }
            const registrationData = registerResponse.data || {};
            if (typeof window !== 'undefined') {
              localStorage.setItem('kose_registration', JSON.stringify(registrationData));
            }
            router.push('/thank-you');
          } else {
            console.error('Registration failed:', registerResponse.error);
            message.error(registerResponse.error || 'Registration failed');
          }
        } catch (registerError) {
          console.error('Registration error:', registerError);
          message.error('Registration failed');
        }
      } else {
        message.error(verifyResponse.error || 'Invalid OTP code');
      }
    } catch (error) {
      message.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setSkipLoading(true);
    try {
      // Handle edit flow
      if (isEdit) {
        // Load pending updates from sessionStorage
        let pendingUpdates = null;
        if (typeof window !== 'undefined') {
          try {
            const stored = sessionStorage.getItem('kose_pending_profile_update');
            if (stored) {
              pendingUpdates = JSON.parse(stored);
            }
          } catch (error) {
            console.warn('Failed to load pending updates:', error);
          }
        }

        if (pendingUpdates) {
          try {
            const updateResponse = await apiClient.patch('/customer/update_profile', {
              customer_id: pendingUpdates.customer_id,
              line_user_id: pendingUpdates.line_id,
              first_name: pendingUpdates.first_name,
              last_name: pendingUpdates.last_name,
              phone: pendingUpdates.phone,
              email: pendingUpdates.email,
              line_id: pendingUpdates.line_id,
              dob: pendingUpdates.dob,
              gender: pendingUpdates.gender,
              image_url: pendingUpdates.image_url,
            });

            if (updateResponse.success) {
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('kose_pending_profile_update');
              }
              message.success('Profile updated successfully');
              router.push('/profile');
              return;
            } else {
              message.error('Failed to update profile');
              return;
            }
          } catch (error) {
            console.error('Update profile error:', error);
            message.error('Failed to update profile');
            return;
          }
        }
      }

      // Registration flow (original logic)
      // Call register API even when skipping email verification
      // Get line_user_id from sessionStorage
      let lineUserId = null;
      if (typeof window !== 'undefined') {
        try {
          const savedProfile = sessionStorage.getItem('kose_liff_profile');
          if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            lineUserId = profile.userId;
          }
        } catch (error) {
          console.warn('Failed to load profile from sessionStorage:', error);
        }
      }
      
      try {
        const registerResponse = await apiClient.post('/customer/register', {
          customer_id: customerId,
          line_user_id: lineUserId,
        });

        console.log('Register response (skip):', registerResponse);

        if (registerResponse.success) {
          // Store registration data in localStorage
          // API returns { success: true, data: { customer: {...} } }
          const registrationData = registerResponse.data || {};
          if (typeof window !== 'undefined') {
            localStorage.setItem('kose_registration', JSON.stringify(registrationData));
          }
          router.push('/thank-you');
        } else {
          console.error('Registration failed:', registerResponse.error);
          message.error(registerResponse.error || 'Registration failed');
        }
      } catch (registerError) {
        console.error('Registration error:', registerError);
        message.error('Registration failed');
      }
    } finally {
      setSkipLoading(false);
    }
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      handleVerify();
    }
  };

  if (!customerId) {
    router.push('/register');
    return null;
  }

  if (!hasEmail) {
    // No email provided, skip to thank you
    router.push('/thank-you');
    return null;
  }

  return (
    <div className="page-container" style={{ paddingTop: 40 }}>
      <PageHeader
        title="Verify Email"
        subtitle="Enter the 6-digit code sent to your email"
      />

      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32, width: '100%', overflow: 'hidden' }}>
          <OtpInput
            onChange={setOtp}
            onComplete={handleOtpComplete}
          />
        </div>

        <Paragraph style={{ textAlign: 'center', color: '#999', fontSize: '12px', marginBottom: 16 }}>
          For testing: Use OTP code <strong style={{ color: '#1f4da1' }}>999999</strong>
        </Paragraph>

        <Paragraph style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>
          Didn&apos;t receive the code? Check your spam folder or{' '}
          <Button type="link" style={{ padding: 0 }}>
            resend
          </Button>
        </Paragraph>

        <Button
          type="primary"
          block
          size="large"
          onClick={handleVerify}
          loading={loading}
          disabled={otp.length !== 6}
          style={{ marginBottom: 12 }}
        >
          Verify
        </Button>

        <Button
          block
          size="large"
          onClick={handleSkip}
          loading={skipLoading}
        >
          Skip for Now
        </Button>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="page-container" style={{ paddingTop: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

