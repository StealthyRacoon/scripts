import { useLocation } from "react-router-dom";
import DefaultLayout from "./DefaultLayout";
import AdminLayout from "./Admin/AdminLayout";

const adminSecret = import.meta.env.VITE_ADMIN_STRING

export default function AppLayout({ children }) {
  const location = useLocation();

  const isDashboard = location.pathname.startsWith(`/${adminSecret}`);

  return isDashboard ? (
    <AdminLayout>{children}</AdminLayout>
  ) : (
    <DefaultLayout>{children}</DefaultLayout>
  );
}