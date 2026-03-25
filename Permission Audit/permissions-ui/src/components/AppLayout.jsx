import { useLocation } from "react-router-dom";
import DefaultLayout from "./DefaultLayout";
import AdminLayout from "./AdminLayout";

export default function AppLayout({ children }) {
  const location = useLocation();

  const isDashboard = location.pathname.startsWith("/admin");

  return isDashboard ? (
    <AdminLayout>{children}</AdminLayout>
  ) : (
    <DefaultLayout>{children}</DefaultLayout>
  );
}