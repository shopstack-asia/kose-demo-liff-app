import { NextRequest, NextResponse } from 'next/server';
import { couponsMock } from '@/mock/coupons';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, coupon_id } = body;

    if (!customer_id || !coupon_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and coupon ID required' },
        { status: 400 }
      );
    }

    const coupon = couponsMock.claim(customer_id, coupon_id);

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Failed to claim coupon' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

