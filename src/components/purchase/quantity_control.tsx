'use client';

import { Button } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
}

export function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max,
}: QuantityControlProps) {
  const canDecrease = quantity > min;
  const canIncrease = max === undefined || quantity < max;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '4px',
        width: 'fit-content',
      }}
    >
      <Button
        type="text"
        icon={<MinusOutlined />}
        onClick={onDecrease}
        disabled={!canDecrease}
        style={{
          minWidth: '32px',
          height: '32px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
      <span
        style={{
          minWidth: '40px',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 500,
        }}
      >
        {quantity}
      </span>
      <Button
        type="text"
        icon={<PlusOutlined />}
        onClick={onIncrease}
        disabled={!canIncrease}
        style={{
          minWidth: '32px',
          height: '32px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    </div>
  );
}

