import { NextRequest, NextResponse } from 'next/server';
import { customerMock } from '@/mock/customer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, otp_code } = body;

    if (!customer_id || !otp_code) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and OTP code required' },
        { status: 400 }
      );
    }

    // Mock: Accept only OTP 999999
    if (otp_code === '999999') {
      // For mock: always return success if OTP is correct
      // Try to verify email, but don't fail if customer doesn't exist yet
      customerMock.verifyEmail(customer_id);
      
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
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

