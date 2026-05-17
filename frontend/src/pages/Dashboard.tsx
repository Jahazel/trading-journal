import { Outlet } from "react-router-dom";
import Sidebar, { BottomNav } from "../components/Sidebar.js";

const Dashboard = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-surface-alt pb-16 md:pb-0">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default Dashboard;
