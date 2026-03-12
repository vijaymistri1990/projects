import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, } from 'reactstrap';
import tsLogo from '../assets/img/slc-logo-preview.png'
import { removeCookies, getCookies } from '../helper/commonFunctions';

const UserHeader = () => {
    let navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [activeLink, setActiveLink] = useState(0);
    const [userInitials, setUserInitials] = useState("U");
    const [userName, setUserName] = useState("");

    const logout = () => {
        removeCookies('userData')
        removeCookies('token')
        navigate('/login')
    }

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

        switch (!(window.location.pathname.startsWith('/admin'))) {
            case window.location.pathname.startsWith('/topic-list'):
                setActiveLink(0);
                break;
            case window.location.pathname.startsWith('/performance-list'):
                setActiveLink(1);
                break;
            case window.location.pathname.startsWith('/work-hour-list'):
                setActiveLink(2);
                break;
        }
    }, []);


    const toggle = () => setDropdownOpen((prevState) => !prevState);

    return (
        <header className='topic-header'>
            <div className="logo">
                <Link to="/topic-list">
                    <img width={'240px'} src={tsLogo} alt="Logo" />
                </Link>
            </div>
            <div>
                <nav>
                    <ul>
                        <li className={activeLink === 0 ? 'active' : ''}>
                            <span onClick={() => { setActiveLink(0); navigate('/topic-list') }}>Simulator</span>
                        </li>
                        <li className={activeLink === 1 ? 'active' : ''}>
                            <span onClick={() => { setActiveLink(1); navigate('/performance-list') }}>Performance</span>
                        </li>
                        <li className={activeLink === 2 ? 'active' : ''}>
                            <span onClick={() => { setActiveLink(2); navigate('/work-hour-list') }}>WorkHour</span>
                        </li>
                    </ul>
                </nav>
            </div>
            <div className="user-actions">
                <Dropdown isOpen={dropdownOpen} toggle={toggle} direction={'down'}>
                    <DropdownToggle caret style={{ background: 'none', border: 'none', padding: 0 }}>
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
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem header style={{ cursor: 'pointer' }} >
                            <span onClick={() => logout()} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><i className="bx bx-power-off dropdown-link-icon"></i>Logout </span>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </header>
    )
}

export default UserHeader