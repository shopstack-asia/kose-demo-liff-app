'use client';

import { Card, Image, Button, Empty } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Product } from '@/data/products';
import { QuantityControl } from './quantity_control';

export interface SelectedProduct extends Product {
  quantity: number;
}

interface SelectedItemListProps {
  items: SelectedProduct[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function SelectedItemList({
  items,
  onQuantityChange,
  onRemove,
}: SelectedItemListProps) {
  if (items.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span style={{ color: '#999' }}>
            No products added yet. Search and add products to continue.
          </span>
        }
        style={{ padding: '40px 0' }}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {items.map((item) => (
        <Card
          key={item.id}
          size="small"
          style={{
            borderRadius: '12px',
            border: '1px solid #f0f0f0',
          }}
          bodyStyle={{ padding: '12px' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Image
              src={item.image_url}
              alt={item.name}
              width={60}
              height={60}
              style={{
                objectFit: 'cover',
                borderRadius: '8px',
              }}
              preview={false}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '8px',
                }}
              >
                SKU: {item.sku}
              </div>
              <QuantityControl
                quantity={item.quantity}
                onIncrease={() => onQuantityChange(item.id, item.quantity + 1)}
                onDecrease={() => onQuantityChange(item.id, item.quantity - 1)}
              />
            </div>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemove(item.id)}
              style={{
                minWidth: '40px',
                height: '40px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}


