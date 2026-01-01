'use client';

import { useState, useMemo } from 'react';
import { Input, Card, Image, Button } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { Product } from '@/data/products';

interface ProductSearchProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  addedProductIds: Set<string>;
}

export function ProductSearch({
  products,
  onAddProduct,
  addedProductIds,
}: ProductSearchProps) {
  const [searchText, setSearchText] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) {
      return [];
    }

    const lowerSearch = searchText.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerSearch) ||
        product.sku.toLowerCase().includes(lowerSearch)
    );
  }, [products, searchText]);

  const handleAddProduct = (product: Product) => {
    onAddProduct(product);
    setSearchText(''); // Clear search after adding
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        zIndex: 10,
        paddingBottom: '16px',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: '16px',
      }}
    >
      <Input
        size="large"
        placeholder="Search by product name or SKU..."
        prefix={<SearchOutlined style={{ color: '#999' }} />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
        style={{ marginBottom: '16px' }}
      />

      {filteredProducts.length > 0 && (
        <div
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {filteredProducts.map((product) => {
            const isAdded = addedProductIds.has(product.id);

            return (
              <Card
                key={product.id}
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
                    src={product.image_url}
                    alt={product.name}
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
                      {product.name}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#999',
                      }}
                    >
                      SKU: {product.sku}
                    </div>
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddProduct(product)}
                    disabled={isAdded}
                    style={{
                      borderRadius: '8px',
                      minWidth: '40px',
                      height: '40px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isAdded ? 'Added' : ''}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

