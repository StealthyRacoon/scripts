import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OwnerPage from "./pages/OwnerPage";
import AdminPage from "./pages/AdminPage";
import AppLayout from "./components/AppLayout";

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/:owner" element={<OwnerPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="*"
            element={<div style={{ padding: 40 }}>Don't even think about it 👀👀</div>}
          />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;