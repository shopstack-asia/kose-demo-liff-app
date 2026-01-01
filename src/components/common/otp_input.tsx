'use client';

import { Input, Space } from 'antd';
import type { InputRef } from 'antd';
import { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
}

export function OtpInput({ length = 6, onChange, onComplete }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(InputRef | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.input?.focus();
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
      inputRefs.current[index + 1]?.input?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.input?.focus();
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'clamp(4px, 2vw, 8px)',
        width: '100%',
        maxWidth: '100%',
        padding: '0 clamp(8px, 4vw, 16px)',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      {values.map((value, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          maxLength={1}
          style={{
            width: 'clamp(38px, 11vw, 48px)',
            height: 'clamp(46px, 13vw, 56px)',
            minWidth: '38px',
            minHeight: '46px',
            fontSize: 'clamp(18px, 5.5vw, 24px)',
            textAlign: 'center',
            fontWeight: 600,
            flexShrink: 0,
            padding: 0,
            borderRadius: '8px',
          }}
        />
      ))}
    </div>
  );
}

