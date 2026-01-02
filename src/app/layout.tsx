'use client';

import { ConfigProvider } from 'antd';
import { koseTheme } from '@/styles/theme';
import { AuthProvider } from '@/lib/auth_context';
import { I18nProvider } from '@/lib/i18n';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <title>KOSE LIFF App</title>
        <meta name="description" content="KOSE LINE LIFF Application" />
      </head>
      <body>
        <ConfigProvider theme={koseTheme}>
          <I18nProvider>
            <AuthProvider>{children}</AuthProvider>
          </I18nProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}

