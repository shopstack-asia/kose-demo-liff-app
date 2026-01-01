import { NextRequest, NextResponse } from 'next/server';
import { customerMock } from '@/mock/customer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { line_user_id, customer_id } = body;

    if (!customer_id && !line_user_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID or Line user ID required' },
        { status: 400 }
      );
    }

    // Mock: Get customer data and return registration result
    // In production, this would call the actual registration API
    let customer = null;
    let actualLineUserId = line_user_id;

    // Try to find customer by customer_id first (if provided)
    if (customer_id) {
      customer = customerMock.findById(customer_id);
      if (customer) {
        actualLineUserId = customer.line_user_id;
      }
    }

    // If not found by customer_id, try to find by line_user_id
    if (!customer && line_user_id) {
      customer = customerMock.findByLineUserId(line_user_id);
      actualLineUserId = line_user_id;
    }
    
    // If customer not found in mock data, return mock success response anyway for testing
    if (!customer) {
      const mockRegistrationResult = {
        success: true,
        data: {
          customer: {
            id: customer_id || 'cust_' + Date.now(),
            line_user_id: actualLineUserId || customer_id || 'line_user_' + Date.now(),
            phone_verified: true,
            email_verified: true,
            terms_accepted: true,
            registered_at: new Date().toISOString(),
          },
        },
        message: 'Registration completed successfully',
      };
      return NextResponse.json(mockRegistrationResult);
    }

    // Mock registration result
    const registrationResult = {
      success: true,
      data: {
        customer: {
          id: customer.id,
          line_user_id: customer.line_user_id,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          email: customer.email,
          phone_verified: customer.phone_verified,
          email_verified: customer.email_verified,
          terms_accepted: customer.terms_accepted,
          registered_at: customer.created_at,
        },
      },
      message: 'Registration completed successfully',
    };

    return NextResponse.json(registrationResult);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

