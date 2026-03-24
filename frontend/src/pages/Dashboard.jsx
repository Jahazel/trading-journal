import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  return (
    <>
      <div className="dashboard-container">
        <Sidebar />
        <div className="entry-container">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
