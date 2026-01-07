'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Checkbox, Typography, Radio, message, Alert, Space } from 'antd';
import { apiClient } from '@/lib/api_client';
import { liff } from '@/lib/liff';
import { useAuthStatus } from '@/lib/auth_context';
import { getTargetPage, clearTargetPage } from '@/lib/redirect_utils';

const { Title, Paragraph, Text } = Typography;

type ConsentValue = 'agree' | 'disagree';

// Fixed action button at bottom
function TermsActionButtons({ canProceed, loading, onContinue }: {
  canProceed: boolean;
  loading: boolean;
  onContinue: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: '16px',
        borderTop: '1px solid #f0f0f0',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        zIndex: 1000,
      }}
    >
      <Button
        type="primary"
        block
        size="large"
        onClick={onContinue}
        disabled={!canProceed}
        loading={loading}
      >
        Continue
      </Button>
    </div>
  );
}

export default function TermsPage() {
  const router = useRouter();
  const [dataProcessingConsent, setDataProcessingConsent] = useState<ConsentValue | undefined>(undefined);
  const [marketingConsent, setMarketingConsent] = useState<ConsentValue | undefined>(undefined);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const termsContainerRef = useRef<HTMLDivElement>(null);
  const { refresh } = useAuthStatus();

  // Check scroll position
  const handleTermsScroll = () => {
    if (termsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      setHasScrolledToBottom(isAtBottom);
    }
  };

  // Check if content fits without scrolling (on mount and resize)
  useEffect(() => {
    const checkScroll = () => {
      if (termsContainerRef.current) {
        const { scrollHeight, clientHeight } = termsContainerRef.current;
        // If content doesn't need scrolling, consider it as "scrolled to bottom"
        if (scrollHeight <= clientHeight) {
          setHasScrolledToBottom(true);
        }
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  // Check if user can proceed
  const canProceed = dataProcessingConsent === 'agree' && termsAccepted && hasScrolledToBottom;

  const handleContinue = async () => {
    if (!canProceed) return;

    setLoading(true);
    try {
      let profile = liff.getProfile();
      
      // If profile is not available, try to load from sessionStorage
      if (!profile && typeof window !== 'undefined') {
        try {
          const savedProfile = sessionStorage.getItem('kose_liff_profile');
          if (savedProfile) {
            profile = JSON.parse(savedProfile);
          }
        } catch (error) {
          console.warn('Failed to load profile from sessionStorage:', error);
        }
      }
      
      // If profile is still not available, try to get LIFF app ID and initialize
      if (!profile) {
        const liffAppId = liff.getLiffAppId();
        if (liffAppId) {
          const initResult = await liff.init(liffAppId);
          if (initResult.success) {
            profile = liff.getProfile();
          }
        }
      }
      
      // If still no profile, use mock profile for development
      if (!profile) {
        profile = {
          userId: 'mock_user_' + Date.now(),
          displayName: 'KOSE Member',
          pictureUrl: 'https://via.placeholder.com/150',
          statusMessage: 'Hello KOSE',
        };
      }

      // Save consent state (mock)
      const response = await apiClient.patch('/customer/profile', {
        line_user_id: profile.userId,
        terms_accepted: true,
        data_processing_consent: dataProcessingConsent === 'agree',
        marketing_consent: marketingConsent === 'agree',
      });

      if (response.success) {
        message.success('Terms and consents accepted successfully');
        await refresh(); // Refresh auth status
        
        // Check for target page
        const targetPage = getTargetPage();
        if (targetPage) {
          clearTargetPage();
          // If target page exists, check if profile is complete
          // If not complete, go to register first, then redirect to target
          router.push('/register');
        } else {
          router.push('/register');
        }
      } else {
        message.error('Failed to accept terms');
      }
    } catch (error) {
      console.error('Failed to accept terms:', error);
      message.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Consent Section - TOP, ALWAYS VISIBLE FIRST */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          Consent for Personal Data Processing
        </Title>
        <Paragraph style={{ marginBottom: 12, color: '#666' }}>
          Consent to collect, use, disclose personal data for:
        </Paragraph>
        <ul style={{ marginBottom: 16, paddingLeft: 20, color: '#666' }}>
          <li>Membership eligibility</li>
          <li>Service provision</li>
          <li>Transaction history</li>
          <li>Service improvement</li>
          <li>Disclosure to service partners when necessary</li>
        </ul>
        <Radio.Group
          value={dataProcessingConsent}
          onChange={(e) => setDataProcessingConsent(e.target.value)}
          style={{ marginBottom: 12 }}
        >
          <Space>
            <Radio value="agree">Agree</Radio>
            <Radio value="disagree">Do Not Agree</Radio>
          </Space>
        </Radio.Group>
        {dataProcessingConsent === 'disagree' && (
          <Alert
            message="Warning"
            description="You must agree to personal data processing to continue using our services."
            type="error"
            showIcon
            style={{ marginTop: 12 }}
          />
        )}
      </Card>

      {/* Marketing Consent Section */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          Consent for Marketing Communication
        </Title>
        <Paragraph style={{ marginBottom: 16, color: '#666' }}>
          Consent to use personal data for marketing, promotions, and benefits
        </Paragraph>
        <Radio.Group
          value={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.value)}
        >
          <Space>
            <Radio value="agree">Agree</Radio>
            <Radio value="disagree">Do Not Agree</Radio>
          </Space>
        </Radio.Group>
      </Card>

      {/* Terms & Conditions Content - AFTER CONSENT */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          Terms & Conditions
        </Title>
        <div
          ref={termsContainerRef}
          onScroll={handleTermsScroll}
          style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: 16 }}
        >
          <Paragraph>
            <strong>1. Membership Terms</strong>
          </Paragraph>
          <Paragraph>
            By joining KOSE membership program, you agree to provide accurate
            information and maintain the security of your account. You are
            responsible for all activities that occur under your account.
          </Paragraph>

          <Paragraph>
            <strong>2. Points & Rewards</strong>
          </Paragraph>
          <Paragraph>
            Points are earned through purchases and can be redeemed for vouchers
            and rewards. Points may expire according to our policy. KOSE
            reserves the right to modify the points system at any time.
          </Paragraph>

          <Paragraph>
            <strong>3. Privacy Policy</strong>
          </Paragraph>
          <Paragraph>
            Your personal information will be used to provide services, send
            promotions, and improve your experience. We respect your privacy and
            handle data securely. For more details, please refer to our{' '}
            <a href="#" style={{ color: '#1f4da1', textDecoration: 'underline', cursor: 'pointer' }}>
              Privacy Notice
            </a>
            .
          </Paragraph>

          <Paragraph>
            <strong>4. Purchase Verification</strong>
          </Paragraph>
          <Paragraph>
            You may be required to provide proof of purchase for offline
            transactions. False information may result in account suspension or
            termination.
          </Paragraph>

          <Paragraph>
            <strong>5. Account Termination</strong>
          </Paragraph>
          <Paragraph>
            KOSE reserves the right to suspend or terminate your account if you
            violate these terms or engage in fraudulent activities.
          </Paragraph>

          <Paragraph>
            <strong>6. Limitation of Liability</strong>
          </Paragraph>
          <Paragraph>
            KOSE shall not be liable for any indirect, incidental, or
            consequential damages arising from your use of the membership program.
          </Paragraph>

          <Paragraph>
            <strong>7. Changes to Terms</strong>
          </Paragraph>
          <Paragraph>
            KOSE may modify these terms at any time. Continued use of the
            service constitutes acceptance of the modified terms.
          </Paragraph>
        </div>
        {!hasScrolledToBottom && (
          <Alert
            message="Please scroll to the bottom to read all terms"
            type="info"
            showIcon
            style={{ marginTop: 12 }}
          />
        )}
      </Card>

      {/* Final Acceptance Checkbox */}
      <Card style={{ marginBottom: 16 }}>
        <Checkbox
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          disabled={!hasScrolledToBottom}
        >
          I have read and accept the Terms & Conditions
        </Checkbox>
        {!hasScrolledToBottom && (
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            Please scroll to the bottom of the terms to enable this checkbox
          </div>
        )}
      </Card>

      {/* Spacer to prevent buttons from covering content */}
      <div style={{ height: 120 }} />
      
      {/* Fixed Action Button - BOTTOM */}
      <TermsActionButtons
        canProceed={canProceed}
        loading={loading}
        onContinue={handleContinue}
      />
    </div>
  );
}
