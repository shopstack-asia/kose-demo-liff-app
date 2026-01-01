'use client';

import { Input, Space } from 'antd';
import { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
}

export function OtpInput({ length = 6, onChange, onComplete }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    const otpValue = newValues.join('');
    onChange?.(otpValue);

    if (otpValue.length === length) {
      onComplete?.(otpValue);
    } else if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (/^\d+$/.test(pastedData)) {
      const newValues = pastedData.split('').concat(Array(length - pastedData.length).fill(''));
      setValues(newValues.slice(0, length));
      const otpValue = newValues.slice(0, length).join('');
      onChange?.(otpValue);
      if (otpValue.length === length) {
        onComplete?.(otpValue);
      }
    }
  };

  return (
    <Space size="middle" style={{ justifyContent: 'center', width: '100%' }}>
      {values.map((value, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          maxLength={1}
          style={{
            width: 48,
            height: 56,
            fontSize: 24,
            textAlign: 'center',
            fontWeight: 600,
          }}
        />
      ))}
    </Space>
  );
}

