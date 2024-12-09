import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as Constant from '../../constants/secretSantaConstants';
import './LogoutButton.css';

const LogoutButton = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        const confirmLogout = window.confirm(Constant.LOGOUT_CONFIRM_MESSAGE);
        if (confirmLogout) {
            logout();
            navigate(Constant.ROUTE_PATH.LOGIN);
        }
    };

    return (
        <button
            className='logout-button'
            onClick={handleLogout}
            style={{
                borderRadius: '10px',
                padding: '6px',
                border: 'solid white',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }}>
            <FaSignOutAlt size={20} color='white' />
        </button>
    );
};

export default LogoutButton;
