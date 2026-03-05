import React, { useState, useEffect } from "react";
import Dropdown from "./Dropdown";
import { Link, useNavigate } from "react-router-dom";
import { removeCookies, getCookies } from "../helper/commonFunctions";

const Header = () => {
  const navigate = useNavigate();
  const [userInitials, setUserInitials] = useState("U");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user data from cookies
    const userData = getCookies('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const name = user.name || user.user_name || "User";
        setUserName(name);

        // Get first two letters of the name
        const initials = name
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        setUserInitials(initials || "U");
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUserInitials("U");
      }
    }
  }, []);

  const logout = () => {
    removeCookies('token')
    removeCookies('userData')
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate('/login')
  }

  return (
    <div className="admin-header">
      <Dropdown
        customAvatar={
          <div
            className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-[#5960e6] tw-flex tw-items-center tw-justify-center tw-text-white tw-font-semibold tw-text-sm tw-cursor-pointer hover:tw-bg-[#484fcc] tw-transition-colors tw-shadow-md"
            title={userName || "User"}
          >
            {userInitials}
          </div>
        }
        menu={
          <>
            {userName && (
              <li className="tw-px-4 tw-py-2 tw-border-b tw-border-gray-200">
                <div className="tw-text-sm tw-font-semibold tw-text-gray-700">{userName}</div>
              </li>
            )}
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
