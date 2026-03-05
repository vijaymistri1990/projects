import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const Adminlayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <Header />
      <Sidebar />
      <div className="admin-content">
        <div className="admin-wrapper">{children}</div>
      </div>
    </div>
  );
};

export default Adminlayout;
