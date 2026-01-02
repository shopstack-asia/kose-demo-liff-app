'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Typography, message } from 'antd';
import { LeftOutlined, CheckOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/layout/page_header';
import { ProductSearch } from '@/components/purchase/product_search';
import { SelectedItemList, SelectedProduct } from '@/components/purchase/selected_item_list';
import { mockProducts, Product } from '@/data/products';
import { apiClient } from '@/lib/api_client';
import { liff } from '@/lib/liff';
import { koseStores } from '@/data/stores';

const { Title } = Typography;

export default function PurchaseItemsPage() {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [customerId, setCustomerId] = useState<string>('');
  const [purchaseInfo, setPurchaseInfo] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load purchase info from sessionStorage
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('kose_purchase_info');
      if (stored) {
        try {
          setPurchaseInfo(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to load purchase info:', error);
          router.push('/purchase');
          return;
        }
      } else {
        // No purchase info, redirect back
        router.push('/purchase');
        return;
      }
    }

    // Load customer ID
    async function loadCustomer() {
      try {
        const lineProfile = liff.getProfile();
        if (!lineProfile) {
          // RouteGuard handles authentication - just return
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
      }
    }

    loadCustomer();
  }, [router]);

  const handleAddProduct = (product: Product) => {
    setSelectedProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === product.id);
      if (existingIndex >= 0) {
        // Product already added, increase quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        // New product, add with quantity 1
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return;

    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemove = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleConfirm = async () => {
    if (selectedProducts.length === 0) {
      message.error('Please add at least one product');
      return;
    }

    if (!customerId || !purchaseInfo) {
      message.error('Missing purchase information');
      return;
    }

    setSubmitting(true);
    try {
      const selectedStore = koseStores.find(
        (store) => store.id === purchaseInfo.store_id
      );

      if (!selectedStore) {
        message.error('Store information not found');
        return;
      }

      const response = await apiClient.post('/purchase/submit', {
        customer_id: customerId,
        store_name: selectedStore.name,
        store_location: selectedStore.address,
        purchase_date: purchaseInfo.purchase_date,
        total_amount: purchaseInfo.total_amount,
        invoice_number: purchaseInfo.invoice_number || undefined,
        receipt_image_url: purchaseInfo.receipt_image || undefined,
        notes: purchaseInfo.notes || undefined,
        products: selectedProducts.map((p) => ({
          product_id: p.id,
          product_name: p.name,
          product_sku: p.sku,
          quantity: p.quantity,
        })),
      });

      if (response.success) {
        // Clear sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('kose_purchase_info');
        }
        message.success('Purchase submitted successfully! Points will be credited soon.');
        router.push('/profile');
      } else {
        message.error(response.error || 'Failed to submit purchase');
      }
    } catch (error) {
      message.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const addedProductIds = new Set(selectedProducts.map((p) => p.id));

  return (
    <div className="page-container">
      <div style={{ marginBottom: '16px' }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => router.back()}
          style={{ padding: 0, marginBottom: '8px' }}
        >
          Back
        </Button>
        <PageHeader
          title="Purchased Items"
          subtitle="Add products you purchased"
        />
      </div>

      <Card>
        <ProductSearch
          products={mockProducts}
          onAddProduct={handleAddProduct}
          addedProductIds={addedProductIds}
        />

        <Title level={5} style={{ marginTop: '24px', marginBottom: '16px' }}>
          Selected Items ({selectedProducts.length})
        </Title>

        <SelectedItemList
          items={selectedProducts}
          onQuantityChange={handleQuantityChange}
          onRemove={handleRemove}
        />
      </Card>

      {/* Fixed bottom action bar */}
      <div
        style={{
          position: 'fixed',
          bottom: '64px', // Above bottom nav
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTop: '1px solid #f0f0f0',
          padding: '16px',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
        }}
      >
        <Button
          type="primary"
          block
          size="large"
          onClick={handleConfirm}
          disabled={selectedProducts.length === 0}
          loading={submitting}
          icon={<CheckOutlined />}
          style={{
            backgroundColor: selectedProducts.length === 0 ? '#ccc' : '#1f4da1',
            borderColor: selectedProducts.length === 0 ? '#ccc' : '#1f4da1',
          }}
        >
          Confirm Items ({selectedProducts.length})
        </Button>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed bottom bar */}
      <div style={{ height: '100px' }} />
    </div>
  );
}

