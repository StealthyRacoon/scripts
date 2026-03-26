import { Layout, Menu, Switch, theme } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  UploadOutlined,
  ProjectOutlined
} from "@ant-design/icons";
import { useAppTheme } from "../../theme/appTheme";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }) {
  const { mode, toggleTheme } = useAppTheme();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  const isDark = mode === "dark";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme={isDark ? "dark" : "light"}
        width={200}
        collapsedWidth={80}
        style={{
          background: isDark ? undefined : token.colorBgContainer,
        }}
      >
        <div
          style={{
            padding: 16,
            fontWeight: "bold",
            color: isDark ? "white" : token.colorTextBase,
            textAlign: collapsed ? "center" : "left",
          }}
        >
          {!collapsed ? "Admin" : "A"}
        </div>

        <Menu
          theme={isDark ? "dark" : "light"}
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={[
            {
              key: "/admin",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "/admin/campaigns",
              icon: <ProjectOutlined />,
              label: "Campaigns",
            },
            {
              key: "/admin/import",
              icon: <UploadOutlined />,
              label: "Import",
            },
            {
              key: "/admin/users",
              icon: <UserOutlined />,
              label: "Users",
            },
            {
              key: "/admin/settings",
              icon: <SettingOutlined />,
              label: "Settings",
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            background: token.colorBgBase,
            borderBottom: `1px solid ${token.colorBorder}`,
            padding: "0 16px",
          }}
        >
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            checkedChildren="Dark"
            unCheckedChildren="Light"
          />
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: token.colorBgContainer,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}