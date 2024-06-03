import React, { useState, useEffect } from 'react';
import { Link, useHistory } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, } from 'reactstrap';
import tsLogo from '../assets/img/slc-logo-preview.png'
import Dropdowns from './Dropdown';
import { removeCookies } from '../helper/commonFunctions';

const UserHeader = () => {
    let history = useHistory();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [activeLink, setActiveLink] = useState(0);

    const logout = () => {
        // localStorage.removeItem("token");
        // localStorage.removeItem("userData");
        removeCookies('userData')
        removeCookies('token')
        history.push('/login')
    }

    useEffect(() => {
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
                            <span onClick={() => { setActiveLink(0); history.push('/topic-list') }}>Simulator</span>
                        </li>
                        <li className={activeLink === 1 ? 'active' : ''}>
                            <span onClick={() => { setActiveLink(1); history.push('/performance-list') }}>Performance</span>
                        </li>
                        <li className={activeLink === 2 ? 'active' : ''}>
                            <span onClick={() => { setActiveLink(2); history.push('/work-hour-list') }}>WorkHour</span>
                        </li>
                    </ul>
                </nav>
            </div>
            <div className="user-actions">
                {/* <Dropdown
                    avatar={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNVvIJRlaurEx4Tu-wGtYMEBLtA1AfLbhRfzT4pkzP&s"}
                    menu={
                        <>
                            <li className="dropdown-list" onClick={() => logout()}>
                                <Link to="/topic-list" className="dropdown-link">
                                    <i className="bx bx-power-off dropdown-link-icon"></i>
                                    Logout
                                </Link>
                            </li>
                        </>
                    }
                /> */}
                <Dropdown isOpen={dropdownOpen} toggle={toggle} direction={'down'}>
                    <DropdownToggle caret><div>
                        <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNVvIJRlaurEx4Tu-wGtYMEBLtA1AfLbhRfzT4pkzP&s' height='40px' width='40px' alt='logo' />
                    </div></DropdownToggle>
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