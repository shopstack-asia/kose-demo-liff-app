'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Form, Input, message } from 'antd';
import { CameraOutlined, CalendarOutlined, DownOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/layout/page_header';
import { LoadingScreen } from '@/components/layout/loading_screen';
import { apiClient } from '@/lib/api_client';
import { liff } from '@/lib/liff';
import { DatePickerDrawer } from '@/components/common/date_picker_drawer';
import { GenderPickerDrawer } from '@/components/common/gender_picker_drawer';
import { ImagePickerDrawer } from '@/components/common/image_picker_drawer';
import dayjs, { Dayjs } from 'dayjs';

interface CustomerProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  line_id?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  image_url?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [genderPickerOpen, setGenderPickerOpen] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        // Check localStorage first - this is the primary data source
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('kose_registration');
          if (stored) {
            try {
              const registrationData = JSON.parse(stored);
              const customer = registrationData?.customer || registrationData?.data?.customer;
              if (customer) {
                setProfile(customer);
                setImageUrl(customer.image_url || '');

                form.setFieldsValue({
                  first_name: customer.first_name,
                  last_name: customer.last_name,
                  phone: customer.phone,
                  email: customer.email,
                  line_id: customer.line_id || '',
                  dob: customer.dob ? dayjs(customer.dob) : undefined,
                  gender: customer.gender,
                });
                setLoading(false);
                return;
              }
            } catch (error) {
              console.error('Error parsing localStorage:', error);
            }
          }
        }

        // If no localStorage, try to get from API using lineProfile (optional fallback)
        const lineProfile = liff.getProfile();
        if (!lineProfile) {
          // RouteGuard handles authentication - just return
          setLoading(false);
          return;
        }

        // Try to load from sessionStorage if LIFF profile is not available
        let profileData = lineProfile;
        if (!profileData && typeof window !== 'undefined') {
          try {
            const savedProfile = sessionStorage.getItem('kose_liff_profile');
            if (savedProfile) {
              profileData = JSON.parse(savedProfile);
            }
          } catch (error) {
            console.warn('Failed to load profile from sessionStorage:', error);
          }
        }

        const response = await apiClient.patch<{
          status: string;
          customer?: CustomerProfile;
        }>('/customer/profile', {
          line_user_id: profileData.userId,
        });

        if (response.success && response.data?.customer) {
          const customer = response.data.customer;
          setProfile(customer);
          setImageUrl(customer.image_url || profileData.pictureUrl || '');

          form.setFieldsValue({
            first_name: customer.first_name,
            last_name: customer.last_name,
            phone: customer.phone,
            email: customer.email,
            line_id: customer.line_id || profileData.userId,
            dob: customer.dob ? dayjs(customer.dob) : undefined,
            gender: customer.gender,
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        message.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router, form]);

  const handleSubmit = async (values: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    line_id?: string;
    dob?: Dayjs;
    gender?: 'male' | 'female' | 'other';
  }) => {
    if (!profile) return;

    // Check if phone or email has changed
    const phoneChanged = values.phone !== profile.phone;
    const emailChanged = values.email !== (profile.email || '');

    // If phone or email changed, redirect to verification flow
    if (phoneChanged || emailChanged) {
      // Store pending updates in sessionStorage
      const pendingUpdates = {
        customer_id: profile.id,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        email: values.email || undefined,
        line_id: values.line_id || undefined,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
        gender: values.gender,
        image_url: imageUrl,
        is_edit: true,
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('kose_pending_profile_update', JSON.stringify(pendingUpdates));
      }

      // Redirect to phone verification first if phone changed
      if (phoneChanged) {
        const emailParam = values.email ? `&email=${encodeURIComponent(values.email)}` : '';
        router.push(`/verify/phone?customer_id=${profile.id}&edit=true${emailParam}`);
        return;
      }

      // If only email changed, redirect to email verification
      if (emailChanged && values.email) {
        router.push(`/verify/email?customer_id=${profile.id}&edit=true`);
        return;
      }
    }

    // No phone/email change, update directly
    setSaving(true);
    try {
      // Get line_user_id from localStorage first, then fallback to lineProfile
      let lineUserId = null;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('kose_registration');
          if (stored) {
            const registrationData = JSON.parse(stored);
            const customer = registrationData?.customer || registrationData?.data?.customer;
            if (customer?.line_id) {
              lineUserId = customer.line_id;
            }
          }
        } catch (error) {
          console.error('Error parsing localStorage:', error);
        }
      }

      // Fallback to lineProfile if not found in localStorage
      if (!lineUserId) {
        const lineProfile = liff.getProfile();
        if (lineProfile) {
          lineUserId = lineProfile.userId;
        } else if (typeof window !== 'undefined') {
          try {
            const savedProfile = sessionStorage.getItem('kose_liff_profile');
            if (savedProfile) {
              const parsed = JSON.parse(savedProfile);
              lineUserId = parsed.userId;
            }
          } catch (error) {
            console.warn('Failed to load profile from sessionStorage:', error);
          }
        }
      }

      const response = await apiClient.patch('/customer/update_profile', {
        customer_id: profile.id,
        line_user_id: lineUserId || values.line_id,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        email: values.email || undefined,
        line_id: values.line_id || undefined,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
        gender: values.gender,
        image_url: imageUrl,
      });

      if (response.success) {
        message.success('Profile updated successfully');
        router.push('/profile');
      } else {
        message.error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      message.error('An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    if (e.target) {
      e.target.value = '';
    }
    setImagePickerOpen(false);
  };

  const handleSelectGallery = () => {
    setImagePickerOpen(false);
    setTimeout(() => {
      galleryInputRef.current?.click();
    }, 200);
  };

  const handleSelectCamera = () => {
    setImagePickerOpen(false);
    setTimeout(() => {
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }, 200);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="page-container">
      <PageHeader title="Edit Profile" />

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
            label="Email"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input size="large" placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            name="line_id"
            label="Line ID"
            rules={[{ required: true, message: 'Please enter your Line ID' }]}
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
              loading={saving}
              style={{ marginBottom: 12 }}
            >
              Save Changes
            </Button>
            <Button
              block
              size="large"
              onClick={() => router.push('/profile')}
              disabled={saving}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
