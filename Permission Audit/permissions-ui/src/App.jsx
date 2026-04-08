import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import OwnerPage from "./pages/OwnerPage";
import AppLayout from "./components/AppLayout";
import AdminImport from "./components/Admin/AdminImport";
import Dashboard from "./pages/Dashboard";
import AdminCampaign from "./components/Admin/AdminCampaign";
import AdminOwners from "./components/Admin/AdminOwners";

import { StatusProvider } from "./providers/StatusProvider";

const adminSecret = import.meta.env.VITE_ADMIN_STRING

function App() {
  return (
    <StatusProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/:owner" element={<OwnerPage />} />
            <Route path={`/${adminSecret}`} element={<Dashboard />} />
            <Route path={`/${adminSecret}/import`} element={<AdminImport />} />
            <Route path={`/${adminSecret}/campaigns`} element={<AdminCampaign />} />
            <Route path={`/${adminSecret}/owners`} element={<AdminOwners />} />
            <Route
              path="*"
              element={<div style={{ padding: 40 }}>Don't even think about it 👀👀</div>}
            />
          </Routes>
        </AppLayout>
      </Router>
    </StatusProvider>
  );
}

export default App;