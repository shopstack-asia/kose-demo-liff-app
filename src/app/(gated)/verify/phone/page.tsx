'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Typography, message } from 'antd';
import { PageHeader } from '@/components/layout/page_header';
import { OtpInput } from '@/components/common/otp_input';
import { apiClient } from '@/lib/api_client';

const { Paragraph } = Typography;

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customer_id');
  const email = searchParams.get('email'); // Email from register page
  const isEdit = searchParams.get('edit') === 'true'; // Check if this is edit flow
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp;
    if (!customerId || otpToVerify.length !== 6) {
      message.error('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/customer/verify_phone', {
        customer_id: customerId,
        otp_code: otpToVerify,
      });

      if (response.success) {
        message.success('Phone verified successfully');
        
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

          // Check if email was provided and changed
          const hasEmail = email && email.trim() !== '';
          const emailChanged = pendingUpdates?.email && pendingUpdates.email !== '';
          
          if (!hasEmail || !emailChanged) {
            // No email or email not changed, update profile directly
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

          // Has email and email changed, proceed to email verification
          router.push(`/verify/email?customer_id=${customerId}&edit=true`);
          return;
        }
        
        // Registration flow (original logic)
        // Check if email was provided - if not, skip email verification
        const hasEmail = email && email.trim() !== '';
        
        if (!hasEmail) {
          // No email provided, skip email verification and register directly
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

          // Call register API
          const registerResponse = await apiClient.post('/customer/register', {
            customer_id: customerId,
            line_user_id: lineUserId,
          });

          if (registerResponse.success) {
            const registrationData = registerResponse.data || { customer: registerResponse.customer };
            if (typeof window !== 'undefined') {
              localStorage.setItem('kose_registration', JSON.stringify(registrationData));
            }
            router.push('/thank-you');
            return;
          } else {
            message.error('Registration failed');
            return;
          }
        }

        // Has email, proceed to email verification
        router.push(`/verify/email?customer_id=${customerId}`);
      } else {
        message.error(response.error || 'Invalid OTP code');
      }
    } catch (error) {
      message.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    // Mock: In production, call API to resend OTP
    message.success('OTP code resent');
    setCountdown(60);
  };

  const handleOtpComplete = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      // Pass the value directly to handleVerify to avoid state update delay
      handleVerify(value);
    }
  };

  if (!customerId) {
    router.push('/register');
    return null;
  }

  return (
    <div className="page-container" style={{ paddingTop: 40 }}>
      <PageHeader
        title="Verify Phone Number"
        subtitle="Enter the 6-digit code sent to your phone"
      />

      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <OtpInput
            onChange={setOtp}
            onComplete={handleOtpComplete}
          />
        </div>

        <Paragraph style={{ textAlign: 'center', color: '#999', fontSize: '12px', marginBottom: 16 }}>
          For testing: Use OTP code <strong style={{ color: '#1f4da1' }}>999999</strong>
        </Paragraph>

        <Paragraph style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span>Resend in {countdown}s</span>
          ) : (
            <Button type="link" onClick={handleResend} style={{ padding: 0 }}>
              Resend
            </Button>
          )}
        </Paragraph>

        <Button
          type="primary"
          block
          size="large"
          onClick={handleVerify}
          loading={loading}
          disabled={otp.length !== 6}
        >
          Verify
        </Button>
      </Card>
    </div>
  );
}

