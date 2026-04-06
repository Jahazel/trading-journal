import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import RootRedirect from "./components/RootRedirect";
import Navbar from "./components/Navbar";
import TradeDetail from "./components/TradeDetail";
import NewEntry from "./components/NewEntry";
import StatsDashboard from "./components/StatsDashboard";

function App() {
  return (
    <>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<StatsDashboard />} />
              <Route path="trades/:id" element={<TradeDetail />} />
              <Route path="trades/new-entry" element={<NewEntry />}></Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
