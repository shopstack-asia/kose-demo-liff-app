import { ConfigProvider } from 'antd';
import { koseTheme } from '@/styles/theme';
import { AuthProvider } from '@/lib/auth_context';
import './globals.css';

export const metadata = {
  title: 'KOSE LIFF App',
  description: 'KOSE LINE LIFF Application',
};

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
      </head>
      <body>
        <ConfigProvider theme={koseTheme}>
          <AuthProvider>{children}</AuthProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}

