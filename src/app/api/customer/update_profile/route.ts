import { NextRequest, NextResponse } from 'next/server';
import { customerMock } from '@/mock/customer';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, line_user_id, ...updates } = body;

    let customer = null;

    // Try to find customer by customer_id first
    if (customer_id) {
      customer = customerMock.findById(customer_id);
    }

    // If not found by customer_id, try to find by line_user_id
    if (!customer && line_user_id) {
      customer = customerMock.findByLineUserId(line_user_id);
    }

    // If still not found, try to create or update via line_user_id
    if (!customer && line_user_id) {
      customer = customerMock.findByLineUserId(line_user_id);
      if (!customer) {
        // Create new customer if doesn't exist
        customer = customerMock.create({
          line_user_id: line_user_id,
          ...updates,
        });
      } else {
        // Update existing customer
        customer = customerMock.update(customer.id, updates) || customer;
      }
    } else if (customer) {
      // Update existing customer
      customer = customerMock.update(customer.id, updates) || customer;
    }

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer ID or Line user ID required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: { customer } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

