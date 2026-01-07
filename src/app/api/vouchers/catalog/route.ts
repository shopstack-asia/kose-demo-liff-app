import { NextResponse } from 'next/server';
import { vouchersMock } from '@/mock/vouchers';

export async function GET() {
  const catalog = vouchersMock.getCatalog();
  return NextResponse.json({ success: true, data: catalog });
}


