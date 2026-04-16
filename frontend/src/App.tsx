import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.js";
import SignupPage from "./pages/SignupPage.js";
import Dashboard from "./pages/Dashboard.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import { AuthProvider } from "./contexts/AuthContext.js";
import RootRedirect from "./components/RootRedirect.js";
import Navbar from "./components/Navbar.js";
import TradeEntryDetail from "./components/TradeEntryDetail.js";
import NewTradeEntry from "./components/NewTradeEntry.js";
import StatsDashboard from "./components/StatsDashboard.js";
import NewNoTradeEntry from "./components/NewNoTradeEntry.js";
import NoTradeEntryDetail from "./components/NoTradeEntryDetail.js";

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
              <Route
                path="trade-entries/new-entry"
                element={<NewTradeEntry />}
              ></Route>
              <Route path="trade-entries/:id" element={<TradeEntryDetail />} />
              <Route
                path="no-trade-entries/new-entry"
                element={<NewNoTradeEntry />}
              ></Route>
              <Route
                path="no-trade-entries/:id"
                element={<NoTradeEntryDetail />}
              />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
