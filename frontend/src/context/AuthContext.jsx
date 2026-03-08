import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('p77_user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse user data:', e);
                localStorage.removeItem('p77_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('p77_user', JSON.stringify(userData));
    };

    const logout = async () => {
        // 1. Immediately clear frontend state
        setUser(null);
        localStorage.removeItem('p77_user');

        // Grab remaining tokens for the background API call
        const token = localStorage.getItem('token');
        const accessToken = localStorage.getItem('access_token');

        localStorage.removeItem('token');
        localStorage.removeItem('access_token');

        // 2. Fire the logout API in the background (fire-and-forget)
        if (token) {
            fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Access-Token': accessToken || '',
                    'Content-Type': 'application/json'
                }
            }).catch(() => {
                // Ignore background task failures completely
            });
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
