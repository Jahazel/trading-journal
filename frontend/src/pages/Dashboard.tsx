import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.js";

const Dashboard = () => {
  return (
    <div className="flex h-[calc(100vh-52px)]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-surface-alt">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
