'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Form, Input, InputNumber, DatePicker, message } from 'antd';
import { CameraOutlined, ShoppingOutlined, DownOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/layout/page_header';
import { LoadingScreen } from '@/components/layout/loading_screen';
import { apiClient } from '@/lib/api_client';
import { liff } from '@/lib/liff';
import { koseStores } from '@/data/stores';
import { StorePickerDrawer } from '@/components/common/store_picker_drawer';
import { ImagePickerDrawer } from '@/components/common/image_picker_drawer';
import dayjs from 'dayjs';

export default function PurchasePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [storePickerOpen, setStorePickerOpen] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadCustomer() {
      try {
        const lineProfile = liff.getProfile();
        if (!lineProfile) {
          router.push('/');
          return;
        }

        const response = await apiClient.patch<{
          status: string;
          customer?: { id: string };
        }>('/customer/profile', {
          line_user_id: lineProfile.userId,
        });

        if (response.success && response.data && response.data.customer?.id) {
          setCustomerId(response.data.customer.id);
        }
      } catch (error) {
        console.error('Failed to load customer:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [router]);

  const handleSubmit = async (values: {
    store_id: string;
    purchase_date: dayjs.Dayjs;
    total_amount: number;
    invoice_number?: string;
    notes?: string;
  }) => {
    if (!customerId) {
      message.error('Customer not found');
      return;
    }

    const selectedStore = koseStores.find((store) => store.id === values.store_id);
    if (!selectedStore) {
      message.error('Please select a store');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient.post('/purchase/submit', {
        customer_id: customerId,
        store_name: selectedStore.name,
        store_location: selectedStore.address,
        purchase_date: values.purchase_date.format('YYYY-MM-DD'),
        total_amount: values.total_amount,
        invoice_number: values.invoice_number || undefined,
        receipt_image_url: receiptImage || undefined,
        notes: values.notes,
      });

      if (response.success) {
        message.success('Purchase submitted successfully! Points will be credited soon.');
        form.resetFields();
        setReceiptImage('');
      } else {
        message.error(response.error || 'Failed to submit purchase');
      }
    } catch (error) {
      message.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (file: File) => {
    // Mock: In production, upload to storage and get URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
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
    setImagePickerOpen(false); // Close picker after selection
  };

  const handleSelectGallery = () => {
    setImagePickerOpen(false); // Close drawer immediately
    setTimeout(() => {
      galleryInputRef.current?.click();
    }, 200); // Small delay to ensure drawer closes
  };

  const handleSelectCamera = () => {
    setImagePickerOpen(false); // Close drawer immediately
    setTimeout(() => {
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }, 200); // Small delay to ensure drawer closes
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Submit Purchase"
        subtitle="Record your offline purchase to earn points"
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{
            purchase_date: dayjs(),
          }}
        >
          <Form.Item
            name="store_id"
            label="Store"
            rules={[{ required: true, message: 'Please select a store' }]}
          >
            <div onClick={() => setStorePickerOpen(true)} style={{ cursor: 'pointer' }}>
              <Input
                size="large"
                placeholder="Select a store"
                readOnly
                value={
                  form.getFieldValue('store_id')
                    ? koseStores.find((s) => s.id === form.getFieldValue('store_id'))?.name || ''
                    : ''
                }
                suffix={<DownOutlined style={{ color: '#999' }} />}
                style={{ cursor: 'pointer', pointerEvents: 'none' }}
              />
            </div>
            <StorePickerDrawer
              open={storePickerOpen}
              onClose={() => setStorePickerOpen(false)}
              value={form.getFieldValue('store_id')}
              onChange={(storeId) => {
                form.setFieldValue('store_id', storeId);
              }}
            />
          </Form.Item>

          <Form.Item
            name="purchase_date"
            label="Purchase Date"
            rules={[{ required: true, message: 'Please select purchase date' }]}
          >
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              maxDate={dayjs()}
            />
          </Form.Item>

          <Form.Item
            name="total_amount"
            label="Total Amount (฿)"
            rules={[
              { required: true, message: 'Please enter total amount' },
              { type: 'number', min: 1, message: 'Amount must be greater than 0' },
            ]}
          >
            <InputNumber
              size="large"
              placeholder="0"
              addonBefore="฿"
              min={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="invoice_number"
            label="Invoice / Receipt Number (Optional)"
          >
            <Input
              size="large"
              placeholder="Enter invoice or receipt number"
            />
          </Form.Item>

          <Form.Item label="Receipt Photo (Optional)">
            <div
              onClick={() => setImagePickerOpen(true)}
              style={{
                border: '2px dashed #d9d9d9',
                borderRadius: 8,
                padding: '40px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundImage: receiptImage ? `url(${receiptImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: receiptImage ? 200 : 'auto',
                position: 'relative',
              }}
            >
              {!receiptImage && (
                <>
                  <CameraOutlined style={{ fontSize: 32, color: '#999', marginBottom: 8 }} />
                  <div style={{ color: '#999' }}>Click to upload receipt</div>
                </>
              )}
              {receiptImage && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setReceiptImage('');
                  }}
                >
                  Remove
                </div>
              )}
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

          <Form.Item name="notes" label="Notes (Optional)">
            <Input.TextArea
              rows={4}
              placeholder="Any additional information..."
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              block
              size="large"
              onClick={() => {
                form.validateFields().then((values) => {
                  // Store purchase info in sessionStorage for next step
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem(
                      'kose_purchase_info',
                      JSON.stringify({
                        ...values,
                        purchase_date: values.purchase_date.format('YYYY-MM-DD'),
                        receipt_image: receiptImage,
                      })
                    );
                  }
                  router.push('/purchase/items');
                });
              }}
              loading={submitting}
              icon={<ShoppingOutlined />}
            >
              Next: Add Products
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

