import { NextResponse } from 'next/server';
import { couponsMock } from '@/mock/coupons';

export async function GET() {
  const catalog = couponsMock.getCatalog();
  return NextResponse.json({ success: true, data: catalog });
}

