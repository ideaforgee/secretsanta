import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATH } from '../constants/secretSantaConstants';
import { isAuthenticated, getUser, logout as logoutService } from '../services/authService';
import  Spinner  from '../pages/spinner/spinner';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated()) {
            setUser(getUser());
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        navigate(ROUTE_PATH.DASHBOARD);
    };

    const logout = () => {
        logoutService();
        setUser(null);
        navigate(ROUTE_PATH.LOGIN);
    };

    if (loading) {
        return <Spinner
        />;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
