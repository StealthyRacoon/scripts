import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';

import { ThemeProvider } from '@/components/theme/theme-provider';
import AppLayout from '@/components/layout/AppLayout';

import 'antd/dist/reset.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AntdRegistry>
          <ThemeProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}