import { NextRequest, NextResponse } from 'next/server';
import { customerMock, CustomerProfile, CustomerStatus } from '@/mock/customer';

export async function GET(request: NextRequest) {
  const lineUserId = request.nextUrl.searchParams.get('line_user_id') || '';

  if (!lineUserId) {
    return NextResponse.json(
      { success: false, error: 'Line user ID required' },
      { status: 400 }
    );
  }

  const status = customerMock.getStatus(lineUserId);
  return NextResponse.json({ success: true, data: status });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const lineUserId = request.headers.get('x-line-user-id') || body.line_user_id;

    if (!lineUserId) {
      return NextResponse.json(
        { success: false, error: 'Line user ID required' },
        { status: 400 }
      );
    }

    let customer = customerMock.findByLineUserId(lineUserId);

    if (!customer) {
      customer = customerMock.create({
        line_user_id: lineUserId,
        ...body,
      });
    } else {
      customer = customerMock.update(customer.id, body) || customer;
    }

    const status = customerMock.getStatus(lineUserId);
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

