import { NextRequest, NextResponse } from 'next/server';
import { vouchersMock } from '@/mock/vouchers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, voucher_id } = body;

    if (!customer_id || !voucher_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and voucher ID required' },
        { status: 400 }
      );
    }

    const voucher = vouchersMock.claim(customer_id, voucher_id);

    if (!voucher) {
      return NextResponse.json(
        { success: false, error: 'Failed to claim voucher' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: voucher });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}


