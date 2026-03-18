// app/components/layout/AppLayout.tsx
'use client';

import { Layout, Typography } from 'antd';
import ThemeToggle from '@/components/theme/theme-toggle';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          Next + AntD + SQLite
        </Title>
        <div style={{ marginLeft: 'auto' }}>
          <ThemeToggle />
        </div>
      </Header>

      <Content style={{ padding: 24 }}>
        {children}
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        Built with Ant Design v5
      </Footer>
    </Layout>
  );
}