import { NextRequest, NextResponse } from 'next/server';
import { customerMock } from '@/mock/customer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, customer_id, otp_code } = body;

    // If phone provided but no customer_id or otp_code, this is a send OTP request
    if (phone && !customer_id && !otp_code) {
      // Mock: Generate customer_id and send OTP
      const customerId = 'cust_phone_' + Date.now();
      
      return NextResponse.json({
        success: true,
        message: 'OTP sent to phone',
        data: {
          customer_id: customerId,
        },
      });
    }

    // Otherwise, this is a verify OTP request
    if (!customer_id || !otp_code) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and OTP code required' },
        { status: 400 }
      );
    }

    // Mock: Accept only OTP 999999
    if (otp_code === '999999') {
      customerMock.verifyPhone(customer_id);
      
      return NextResponse.json({
        success: true,
        message: 'Phone verified successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid OTP code' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

