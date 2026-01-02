import { NextRequest, NextResponse } from 'next/server';
import { purchaseMock } from '@/mock/purchase';
import { pointsMock } from '@/mock/points';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, ...purchaseData } = body;

    if (!customer_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID required' },
        { status: 400 }
      );
    }

    const purchase = purchaseMock.submit({
      customer_id,
      ...purchaseData,
    });

    // Add points transaction
    if (purchase.points_earned > 0) {
      pointsMock.addTransaction({
        customer_id,
        points: purchase.points_earned,
        type: 'earned',
        description: `Points earned from purchase at ${purchase.store_name}`,
      });
    }

    return NextResponse.json({ success: true, data: purchase });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}


