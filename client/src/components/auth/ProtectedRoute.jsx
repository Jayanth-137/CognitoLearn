import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // AppContent already handles auth bootstrapping state.
    // Avoid rendering a second loader on top of the splash/route loaders.
    if (loading) {
        return null;
    }

    if (!isAuthenticated) {
        // Redirect to login, but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
