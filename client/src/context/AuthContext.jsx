import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        // Check both storages: localStorage for remembered sessions, sessionStorage for tab sessions
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/verify');
            if (response.data.valid) {
                setUser(response.data.user);
            } else {
                setUser(null);
                localStorage.removeItem('accessToken');
                sessionStorage.removeItem('accessToken');
            }
        } catch (error) {
            console.error('Auth verification failed:', error);
            setUser(null);
            localStorage.removeItem('accessToken');
            sessionStorage.removeItem('accessToken');
        } finally {
            setLoading(false);
        }
    };

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password, rememberMe) => {
        try {
            const response = await api.post('/auth/login', { email, password, rememberMe });
            const { user, accessToken } = response.data;

            if (rememberMe) {
                // Persist across browser restarts
                localStorage.setItem('accessToken', accessToken);
                sessionStorage.removeItem('accessToken');
            } else {
                // Only last for this browser tab/session
                sessionStorage.setItem('accessToken', accessToken);
                localStorage.removeItem('accessToken');
            }

            setUser(user);
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Login failed';
            return { success: false, error: message };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { user, accessToken } = response.data;

            localStorage.setItem('accessToken', accessToken);
            setUser(user);
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Signup failed';
            return { success: false, error: message };
        }
    };

    const updateProfile = async (updatedData) => {
        try {
            const response = await api.put('/users/profile', updatedData);
            setUser(prev => ({ ...prev, ...updatedData }));
            return { success: true };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: error.response?.data?.error || 'Update failed' };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('accessToken');
            sessionStorage.removeItem('accessToken');
            // The cookie is httpOnly, so we can't delete it from JS,
            // but the server call above should have cleared it.
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        updateProfile,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
