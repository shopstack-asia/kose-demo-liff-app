import { NextRequest, NextResponse } from 'next/server';
import { vouchersMock } from '@/mock/vouchers';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json(
      { success: false, error: 'Customer ID required' },
      { status: 400 }
    );
  }

  const vouchers = vouchersMock.getMyVouchers(customerId);
  return NextResponse.json({ success: true, data: vouchers });
}


