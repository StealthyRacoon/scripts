import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OwnerPage from "./pages/OwnerPage";
import AdminPage from "./pages/AdminPage";
import AppLayout from "./components/AppLayout";
import AdminImport from "./components/Admin/AdminImport";
import Dashboard from "./pages/Dashboard";
import { StatusProvider } from "./providers/StatusProvider";

function App() {
  return (
    <StatusProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/:owner" element={<OwnerPage />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/import" element={<AdminImport />} />
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