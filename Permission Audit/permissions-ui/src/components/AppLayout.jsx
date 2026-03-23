import { Layout, Switch, Typography, theme } from "antd";
import { useAppTheme } from "../theme/appTheme";

const { Header, Content, Footer } = Layout;

export default function AppLayout({ children }) {
  const { mode, toggleTheme } = useAppTheme();
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${token.colorBorder}`,
          background: token.colorBgBase,
        }}
      >
        <Typography.Title
          level={4}
          style={{
            color: token.colorTextBase,
            margin: 0,
          }}
        >
          SharePoint Review
        </Typography.Title>

        <Switch
          checked={mode === "dark"}
          onChange={toggleTheme}
          checkedChildren="Dark"
          unCheckedChildren="Light"
        />
      </Header>

      <Content style={{ padding: 24 }}>{children}</Content>

      <Footer style={{ textAlign: "center", color: token.colorTextSecondary }}>
        Sustainable Timber Tasmania
      </Footer>
    </Layout>
  );
}