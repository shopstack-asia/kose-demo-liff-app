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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Preserve query params from LIFF URL before any redirects
                // This runs immediately when page loads, before React hydration
                if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
                  try {
                    const urlParams = new URLSearchParams(window.location.search);
                    let pageParam = urlParams.get('page');
                    
                    // Also check liff.state parameter (LIFF may pass params this way)
                    if (!pageParam) {
                      const liffState = urlParams.get('liff.state');
                      if (liffState) {
                        try {
                          const decodedState = decodeURIComponent(liffState);
                          const stateStr = decodedState.startsWith('?') ? decodedState.substring(1) : decodedState;
                          const stateParams = new URLSearchParams(stateStr);
                          pageParam = stateParams.get('page');
                        } catch (error) {
                          console.warn('[PreserveScript] Failed to parse liff.state:', error);
                        }
                      }
                    }
                    
                    if (pageParam) {
                      sessionStorage.setItem('kose_liff_page_param', pageParam);
                    }
                  } catch (error) {
                    console.warn('[PreserveScript] Failed to preserve page param:', error);
                  }
                }
              })();
            `,
          }}
        />
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

