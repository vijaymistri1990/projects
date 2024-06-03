import React from "react";
import Dropdown from "./Dropdown";
import { Link, useHistory } from "react-router-dom";
import { removeCookies } from "../helper/commonFunctions";

const Header = () => {
  const history = useHistory();
  const logout = () => {
    removeCookies('token')
    removeCookies('userData')
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    history.push('/login')
  }

  return (
    <div className="admin-header">
      <Dropdown
        avatar={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNVvIJRlaurEx4Tu-wGtYMEBLtA1AfLbhRfzT4pkzP&s"}
        menu={
          <>
            <li className="dropdown-list" onClick={() => logout()}>
              <Link to="/admin/dashboard" className="dropdown-link">
                <i className="bx bx-power-off dropdown-link-icon"></i>
                Logout
              </Link>
            </li>
          </>
        }
      />
    </div>
  );
};

export default Header;
