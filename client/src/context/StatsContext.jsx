import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const StatsContext = createContext();

export const useStats = () => {
    const context = useContext(StatsContext);
    if (!context) {
        throw new Error('useStats must be used within StatsProvider');
    }
    return context;
};

export const StatsProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchStreak = async () => {
        if (!isAuthenticated) return;
        try {
            // setLoading(true); // Optional: avoid flickering loading state for background updates
            const response = await api.get('/analytics/streaks');
            if (response.data.success) {
                setStreak(response.data.streaks.current || 0);
            }
        } catch (err) {
            console.log('Streaks not available');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchStreak();
        } else {
            setStreak(0);
        }
    }, [isAuthenticated]);

    const value = {
        streak,
        loading,
        refreshStreak: fetchStreak
    };

    return (
        <StatsContext.Provider value={value}>
            {children}
        </StatsContext.Provider>
    );
};
