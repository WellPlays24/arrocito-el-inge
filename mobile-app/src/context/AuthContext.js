import React, { createContext, useState, useContext } from 'react';
import { setAuthToken } from '../features/dashboard/services/dashboardService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        setAuthToken(authToken); // Save token for API requests
        // In production, save to AsyncStorage
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setAuthToken(null); // Clear token from API requests
        // In production, clear AsyncStorage
    };

    const isAuthenticated = () => {
        return !!token;
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const getUserRole = () => {
        return user?.role || 'customer';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated,
                isAdmin,
                getUserRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
