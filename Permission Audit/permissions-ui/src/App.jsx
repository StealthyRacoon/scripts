import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OwnerPage from "./pages/OwnerPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:owner" element={<OwnerPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="*"
          element={
            <div style={{ padding: 40 }}>
              <h2>Don't even think about it 👀👀</h2>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;