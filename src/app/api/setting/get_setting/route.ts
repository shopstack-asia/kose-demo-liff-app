import { NextRequest, NextResponse } from 'next/server';

export interface Language {
  code: string;
  name: string;
  flag?: string;
}

export interface Translation {
  code: string;
  translate: Record<string, string>;
}

export interface SettingResponse {
  name: string;
  code: string;
  liff_app_id: string;
  languages: Language[];
  translate: Translation[];
  default_language?: string;
}

export async function GET(request: NextRequest) {
  const liffAppCode = request.nextUrl.searchParams.get('code');

  if (!liffAppCode) {
    return NextResponse.json(
      { success: false, error: 'LIFF app code required' },
      { status: 400 }
    );
  }

  // Mock: Return mock data with languages and translations
  // In production, this will call CS API: GET /api/v1/setting/get_setting?code={CS_LIFF_APP_CODE}
  const mockSetting: SettingResponse = {
    name: 'MOCK TEST',
    code: 'MOCK',
    liff_app_id: '2008806049-Fm2qVcAg',
    // liff_app_id: '2007413561-1tM0q5cE',
    default_language: 'th-TH',
    languages: [
      { code: 'th-TH', name: 'ไทย', flag: '🇹🇭' },
      { code: 'en-US', name: 'English', flag: '🇺🇸' },
      { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
      { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    ],
    translate: [
      {
        code: 'th-TH',
        translate: {
          'app.name': 'KOSE',
          'login.title': 'เข้าสู่ระบบ',
          'login.subtitle': 'เลือกวิธีเข้าสู่ระบบ',
          'login.email': 'อีเมล',
          'login.phone': 'เบอร์โทรศัพท์',
          'login.google': 'เข้าสู่ระบบด้วย Google',
          'login.apple': 'เข้าสู่ระบบด้วย Apple',
          'login.line': 'เข้าสู่ระบบด้วย LINE',
          'login.email.placeholder': 'กรอกอีเมลของคุณ',
          'login.phone.placeholder': 'กรอกเบอร์โทรศัพท์',
          'login.emailOrPhone.placeholder': 'กรุณากรอกเบอร์โทรศัพท์ หรือ อีเมล์',
          'login.otp.send': 'ส่งรหัส OTP',
          'login.otp.verify': 'ยืนยันรหัส',
          'login.otp.placeholder': 'กรอกรหัส 6 หลัก',
          'login.otp.test.hint': 'สำหรับทดสอบ: ใช้รหัส OTP',
          'login.otp.resend.text': 'ไม่ได้รับรหัส?',
          'login.otp.resend.countdown': 'ส่งใหม่ใน',
          'login.otp.resend.button': 'ส่งใหม่',
          'login.continue': 'ดำเนินการต่อ',
          'login.register.required': 'กรุณากรอกข้อมูลเพิ่มเติมเพื่อสมัครสมาชิก',
          'common.continue': 'ดำเนินการต่อ',
          'common.cancel': 'ยกเลิก',
          'common.loading': 'กำลังโหลด...',
          'common.error': 'เกิดข้อผิดพลาด',
          'common.or': 'หรือ',
        },
      },
      {
        code: 'en-US',
        translate: {
          'app.name': 'KOSE',
          'login.title': 'Sign In',
          'login.subtitle': 'Choose your sign-in method',
          'login.email': 'Email',
          'login.phone': 'Phone',
          'login.google': 'Sign in with Google',
          'login.apple': 'Sign in with Apple',
          'login.line': 'Sign in with LINE',
          'login.email.placeholder': 'Enter your email',
          'login.phone.placeholder': 'Enter your phone number',
          'login.emailOrPhone.placeholder': 'Please enter your phone number or email',
          'login.otp.send': 'Send OTP',
          'login.otp.verify': 'Verify Code',
          'login.otp.placeholder': 'Enter 6-digit code',
          'login.otp.test.hint': 'For testing: Use OTP code',
          'login.otp.resend.text': "Didn't receive the code?",
          'login.otp.resend.countdown': 'Resend in',
          'login.otp.resend.button': 'Resend',
          'login.continue': 'Continue',
          'login.register.required': 'Please complete your profile to register',
          'common.continue': 'Continue',
          'common.cancel': 'Cancel',
          'common.loading': 'Loading...',
          'common.error': 'An error occurred',
          'common.or': 'or',
        },
      },
      {
        code: 'ja-JP',
        translate: {
          'app.name': 'KOSE',
          'login.title': 'サインイン',
          'login.subtitle': 'サインイン方法を選択',
          'login.email': 'メール',
          'login.phone': '電話',
          'login.google': 'Googleでサインイン',
          'login.apple': 'Appleでサインイン',
          'login.line': 'LINEでサインイン',
          'login.email.placeholder': 'メールアドレスを入力',
          'login.phone.placeholder': '電話番号を入力',
          'login.emailOrPhone.placeholder': '電話番号またはメールアドレスを入力してください',
          'login.otp.send': 'OTPを送信',
          'login.otp.verify': 'コードを確認',
          'login.otp.placeholder': '6桁のコードを入力',
          'login.otp.test.hint': 'テスト用: OTPコード',
          'login.otp.resend.text': 'コードが届かない場合',
          'login.otp.resend.countdown': '再送信まで',
          'login.otp.resend.button': '再送信',
          'login.continue': '続行',
          'login.register.required': '会員登録のため、追加情報を入力してください',
          'common.continue': '続行',
          'common.cancel': 'キャンセル',
          'common.loading': '読み込み中...',
          'common.error': 'エラーが発生しました',
          'common.or': 'または',
        },
      },
      {
        code: 'zh-CN',
        translate: {
          'app.name': 'KOSE',
          'login.title': '登录',
          'login.subtitle': '选择登录方式',
          'login.email': '邮箱',
          'login.phone': '电话',
          'login.google': '使用 Google 登录',
          'login.apple': '使用 Apple 登录',
          'login.line': '使用 LINE 登录',
          'login.email.placeholder': '输入您的邮箱',
          'login.phone.placeholder': '输入您的电话号码',
          'login.emailOrPhone.placeholder': '请输入您的电话号码或邮箱',
          'login.otp.send': '发送验证码',
          'login.otp.verify': '验证代码',
          'login.otp.placeholder': '输入6位数字代码',
          'login.otp.test.hint': '测试用: 使用OTP代码',
          'login.otp.resend.text': '未收到代码?',
          'login.otp.resend.countdown': '重新发送还需',
          'login.otp.resend.button': '重新发送',
          'login.continue': '继续',
          'login.register.required': '请完成您的个人资料以注册',
          'common.continue': '继续',
          'common.cancel': '取消',
          'common.loading': '加载中...',
          'common.error': '发生错误',
          'common.or': '或',
        },
      },
    ],
  };

  return NextResponse.json({ success: true, data: mockSetting });
}

