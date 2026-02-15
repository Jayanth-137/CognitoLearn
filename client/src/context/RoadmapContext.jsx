import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const RoadmapContext = createContext();

export const useRoadmaps = () => {
    const context = useContext(RoadmapContext);
    if (!context) {
        throw new Error('useRoadmaps must be used within RoadmapProvider');
    }
    return context;
};

export const RoadmapProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all roadmaps
    const fetchRoadmaps = useCallback(async () => {
        if (!isAuthenticated) {
            setRoadmaps([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/roadmaps');
            if (response.data.success) {
                setRoadmaps(response.data.roadmaps);
            }
        } catch (err) {
            console.error('Failed to fetch roadmaps:', err);
            setError('Failed to load roadmaps');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch roadmaps when authenticated
    useEffect(() => {
        fetchRoadmaps();
    }, [fetchRoadmaps]);

    // Delete a roadmap
    const deleteRoadmap = async (id) => {
        try {
            const response = await api.delete(`/roadmaps/${id}`);
            // Check for success - either explicit success flag or successful HTTP status
            if (response.data.success || response.status === 200) {
                // Update local state directly - no extra API call needed
                setRoadmaps(prev => prev.filter(r => r._id !== id));
                return { success: true };
            }
            return { success: false, error: 'Delete failed' };
        } catch (err) {
            console.error('Failed to delete roadmap:', err);
            return { success: false, error: err.response?.data?.error || 'Failed to delete roadmap' };
        }
    };

    // Update a roadmap (for progress updates, etc.)
    const updateRoadmap = (updatedRoadmap) => {
        setRoadmaps(prev =>
            prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r)
        );
    };

    // Add a new roadmap to the list
    const addRoadmap = (newRoadmap) => {
        setRoadmaps(prev => [newRoadmap, ...prev]);
    };

    // Get a single roadmap by ID from cache
    const getRoadmapById = (id) => {
        return roadmaps.find(r => r._id === id) || null;
    };

    const value = {
        roadmaps,
        loading,
        error,
        fetchRoadmaps,
        deleteRoadmap,
        updateRoadmap,
        addRoadmap,
        getRoadmapById
    };

    return (
        <RoadmapContext.Provider value={value}>
            {children}
        </RoadmapContext.Provider>
    );
};
