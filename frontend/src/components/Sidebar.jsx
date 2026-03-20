import api from "../api/api";

const Sidebar = () => {
  
  
    return (
    <>
      <div className="sidebar-container">
        <h1>Journal Entries</h1>
        <div className="entries-container"></div>
        <button className="new-entry-btn" onClick={""}>
          +
        </button>
      </div>
    </>
  );
};

export default Sidebar;
