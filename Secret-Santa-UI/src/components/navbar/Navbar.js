import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoHome } from 'react-icons/io5';
import { ROUTE_PATH } from '../../constants/secretSantaConstants';
import LogoutButton from '../LogoutButton/LogoutButton';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();

    const handleHomeClick = () => {
        navigate(ROUTE_PATH.DASHBOARD);
    };

    return (
        <nav className='navbar'>
            <div className='navbar-left'>
                <IoHome
                    className='home-icon'
                    onClick={handleHomeClick}
                    title='Go to Home'
                />
            </div>
            <div className='navbar-center'>
                <h1 className='navbar-heading'>Secret Santa</h1>
            </div>
            <div className='navbar-right'>
                <LogoutButton />
            </div>
        </nav>
    );
}

export default Navbar;
