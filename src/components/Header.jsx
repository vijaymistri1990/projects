import { useState, useEffect } from "react";
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
          .slice(0, 3);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>
                Hello, <span style={{ fontWeight: '600', color: '#1a202c' }}>{userName || "User"}</span>
              </span>
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#5960e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              title={userName || "User"}
            >
              {userInitials}
            </div>
          </div>
        }
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
