import { NextRequest, NextResponse } from 'next/server';
import { pointsMock } from '@/mock/points';
import dayjs from 'dayjs';

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get('customer_id');

  if (!customerId) {
    return NextResponse.json(
      { success: false, error: 'Customer ID required' },
      { status: 400 }
    );
  }

  const summary = pointsMock.getSummary(customerId);
  
  return NextResponse.json({ 
    success: true, 
    data: summary
  });
}

