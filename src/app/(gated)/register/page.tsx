'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Form, Input, Upload, message } from 'antd';
import { UserOutlined, CameraOutlined, CalendarOutlined, DownOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/layout/page_header';
import { apiClient } from '@/lib/api_client';
import { liff } from '@/lib/liff';
import { useAuthStatus } from '@/lib/auth_context';
import { DatePickerDrawer } from '@/components/common/date_picker_drawer';
import { GenderPickerDrawer } from '@/components/common/gender_picker_drawer';
import { ImagePickerDrawer } from '@/components/common/image_picker_drawer';
import { getTargetPage, setTargetPage } from '@/lib/redirect_utils';
import dayjs, { Dayjs } from 'dayjs';

export default function RegisterPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [genderPickerOpen, setGenderPickerOpen] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { refresh } = useAuthStatus();

  // Load LINE profile picture and Line ID as default
  useEffect(() => {
    const loadProfile = async () => {
      let profile = liff.getProfile();
      
      // Try to load from sessionStorage if LIFF profile is not available
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
      
      // If still no profile, use mock profile for development (fallback)
      if (!profile) {
        profile = {
          userId: 'mock_user_' + Date.now(),
          displayName: 'KOSE Member',
          pictureUrl: 'https://via.placeholder.com/150',
          statusMessage: 'Hello KOSE',
        };
      }
      
      // Set LINE profile picture as default if available
      if (profile?.pictureUrl) {
        setImageUrl(profile.pictureUrl);
      }
      
      // Set Line ID as default if available
      if (profile?.userId) {
        form.setFieldValue('line_id', profile.userId);
      }
    };
    
    loadProfile();
  }, [form]);

  const handleSubmit = async (values: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    line_id?: string;
    dob: dayjs.Dayjs;
    gender?: 'male' | 'female' | 'other';
  }) => {
    setLoading(true);
    try {
      let profile = liff.getProfile();
      
      // Try to load from sessionStorage if LIFF profile is not available
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
      
      // If still no profile, use mock profile for development (fallback)
      if (!profile) {
        profile = {
          userId: 'mock_user_' + Date.now(),
          displayName: 'KOSE Member',
          pictureUrl: 'https://via.placeholder.com/150',
          statusMessage: 'Hello KOSE',
        };
      }

      const response = await apiClient.patch<{
        status: string;
        customer?: { id: string };
      }>('/customer/profile', {
        line_user_id: profile.userId,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        email: values.email || undefined,
        line_id: values.line_id || undefined,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
        gender: values.gender,
        image_url: imageUrl || profile.pictureUrl,
      });

      if (response.success && response.data && response.data.customer) {
        const customer = response.data.customer;
        await refresh(); // Refresh auth status
        
        // Preserve target page for after verification
        const targetPage = getTargetPage();
        if (targetPage) {
          setTargetPage(targetPage);
        }
        
        // Pass email in query params if provided
        const emailParam = values.email ? `&email=${encodeURIComponent(values.email)}` : '';
        router.push(`/verify/phone?customer_id=${customer.id}${emailParam}`);
      } else {
        message.error('Failed to save profile');
      }
    } catch (error) {
      message.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file: File) => {
    // Mock: In production, upload to storage and get URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    return false; // Prevent default upload
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSelectGallery = () => {
    galleryInputRef.current?.click();
  };

  const handleSelectCamera = () => {
    // Use setTimeout to ensure drawer is closed before triggering camera
    // This is important for mobile browsers to properly trigger camera
    setTimeout(() => {
      cameraInputRef.current?.click();
    }, 200);
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Complete Your Profile"
        subtitle="Please provide your information to continue"
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item label="Profile Photo" style={{ textAlign: 'center' }}>
            <div
              onClick={() => setImagePickerOpen(true)}
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                border: '2px dashed #d9d9d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                cursor: 'pointer',
                backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}
            >
              {!imageUrl && <CameraOutlined style={{ fontSize: 32, color: '#999' }} />}
            </div>
            {/* Hidden file inputs */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageFileChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleImageFileChange}
            />
            <ImagePickerDrawer
              open={imagePickerOpen}
              onClose={() => setImagePickerOpen(false)}
              onSelectGallery={handleSelectGallery}
              onSelectCamera={handleSelectCamera}
            />
          </Form.Item>

          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: 'Please enter your first name' }]}
          >
            <Input size="large" placeholder="First Name" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter your last name' }]}
          >
            <Input size="large" placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid phone number' },
            ]}
          >
            <Input size="large" placeholder="0812345678" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email (Optional)"
            rules={[
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input size="large" placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            name="line_id"
            label="Line ID"
            rules={[
              { required: true, message: 'Please enter your Line ID' },
            ]}
          >
            <Input size="large" placeholder="Line ID" />
          </Form.Item>

          <Form.Item name="dob" label="Date of Birth">
            <div onClick={() => setDatePickerOpen(true)} style={{ cursor: 'pointer' }}>
              <Input
                size="large"
                placeholder="Select date"
                readOnly
                value={form.getFieldValue('dob') ? form.getFieldValue('dob').format('YYYY-MM-DD') : ''}
                suffix={<CalendarOutlined style={{ color: '#999' }} />}
                style={{ cursor: 'pointer', pointerEvents: 'none' }}
              />
            </div>
            <DatePickerDrawer
              open={datePickerOpen}
              onClose={() => setDatePickerOpen(false)}
              value={form.getFieldValue('dob')}
              onChange={(date) => {
                form.setFieldValue('dob', date);
              }}
              maxDate={dayjs().subtract(13, 'year')}
            />
          </Form.Item>

          <Form.Item name="gender" label="Gender">
            <div onClick={() => setGenderPickerOpen(true)} style={{ cursor: 'pointer' }}>
              <Input
                size="large"
                placeholder="Select gender"
                readOnly
                value={
                  form.getFieldValue('gender') === 'male'
                    ? 'Male'
                    : form.getFieldValue('gender') === 'female'
                    ? 'Female'
                    : form.getFieldValue('gender') === 'other'
                    ? 'Other'
                    : ''
                }
                suffix={<DownOutlined style={{ color: '#999' }} />}
                style={{ cursor: 'pointer', pointerEvents: 'none' }}
              />
            </div>
            <GenderPickerDrawer
              open={genderPickerOpen}
              onClose={() => setGenderPickerOpen(false)}
              value={form.getFieldValue('gender')}
              onChange={(value) => {
                form.setFieldValue('gender', value);
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              block
              size="large"
              htmlType="submit"
              loading={loading}
            >
              Continue
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

