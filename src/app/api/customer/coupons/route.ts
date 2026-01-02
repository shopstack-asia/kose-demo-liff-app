import { NextRequest, NextResponse } from 'next/server';
import { couponsMock } from '@/mock/coupons';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json(
      { success: false, error: 'Customer ID required' },
      { status: 400 }
    );
  }

  const coupons = couponsMock.getMyCoupons(customerId);
  return NextResponse.json({ success: true, data: coupons });
}


