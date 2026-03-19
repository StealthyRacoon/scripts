import { Layout, Switch, Typography } from "antd";
import { useAppTheme } from "../theme/appTheme";

const { Header, Content, Footer } = Layout;

export default function AppLayout({ children }) {
  const { mode, toggleTheme } = useAppTheme();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography.Title level={4} style={{ color: "white", margin: 0 }}>
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

      <Footer style={{ textAlign: "center" }}>
        Permission Review Tool
      </Footer>
    </Layout>
  );
}