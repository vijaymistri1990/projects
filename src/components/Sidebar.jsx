import React, { useEffect, useState } from "react";
import SCLOGO from "../assets/img/slc-logo.jpeg";
import sidebar_routes from "../assets/json/sidebar_routes.json";
import { Link, useNavigate, useLocation } from "react-router-dom";

const SidebarItem = (props) => {
  const active = props.active ? "active" : "";

  return (
    <div className={`admin-sidebar-item ${active}`}>
      <div className="admin-sidebar-icon">
        <i className={props.icon}></i>
      </div>
      <span className="admin-sidebar-name">{props.name}</span>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('');

  useEffect(() => {
    setActiveItem(
      location.pathname.includes("user") ? 1 :
        location.pathname.includes("simulator") ? 2 :
          0
    );
  }, [location.pathname]);

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-logo cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
          <img src={SCLOGO} alt="" className="img-logo" />
          {/* <h1 className="logo-name">Simple Coding</h1> */}
        </div>
      </div>
      <div className="admin-sidebar-menu">
        {sidebar_routes.map((item, idx) => (
          <Link className="admin-sidebar-link" key={idx} to={item.route}>
            <SidebarItem
              name={item.display_name}
              icon={item.icon}
              active={idx === activeItem}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
