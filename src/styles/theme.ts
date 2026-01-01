/**
 * KOSE Theme Configuration
 * Clean, premium, soft, minimal
 */

import { ThemeConfig } from 'antd';

export const koseTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1f4da1', // KOSE primary button color
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 16,
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 48,
      fontWeight: 500,
    },
    Card: {
      borderRadius: 12,
      paddingLG: 20,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 48,
    },
    Form: {
      verticalLabelPadding: '0 0 8px',
    },
  },
};

