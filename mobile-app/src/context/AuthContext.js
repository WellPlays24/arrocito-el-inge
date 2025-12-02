import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load token and user from storage on app start
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error loading auth from storage:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData, authToken) => {
        try {
            setUser(userData);
            setToken(authToken);

            // Save to AsyncStorage
            await AsyncStorage.setItem('token', authToken);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving auth to storage:', error);
        }
    };

    const logout = async () => {
        try {
            setUser(null);
            setToken(null);

            // Clear AsyncStorage
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        } catch (error) {
            console.error('Error clearing auth from storage:', error);
        }
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
                loading,
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
