import { NextRequest, NextResponse } from 'next/server';

export interface SettingResponse {
  name: string;
  code: string;
  liff_app_id: string;
}

export async function GET(request: NextRequest) {
  const liffAppCode = request.nextUrl.searchParams.get('code');

  if (!liffAppCode) {
    return NextResponse.json(
      { success: false, error: 'LIFF app code required' },
      { status: 400 }
    );
  }

  // Mock: Return mock data
  // In production, this will call CS API: GET /api/v1/setting/get_setting?code={CS_LIFF_APP_CODE}
  const mockSetting: SettingResponse = {
    name: 'MOCK TEST',
    code: 'MOCK',
    liff_app_id: '2007413561-1tM0q5cE',
  };

  return NextResponse.json({ success: true, data: mockSetting });
}

