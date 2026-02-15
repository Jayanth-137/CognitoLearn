import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true, // Important for cookies (refresh tokens)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach access token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Skip token refresh logic for auth endpoints - they handle their own errors
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                               originalRequest.url?.includes('/auth/register') ||
                               originalRequest.url?.includes('/auth/refresh');

        // If 401 and we haven't retried yet (and not an auth endpoint)
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                // Call refresh token endpoint - we use a separate axios instance 
                // or the same one but carefully to avoid infinite loops. 
                // Since our refresh endpoint relies on cookies, we just need withCredentials: true.
                // We use a clean axios call to avoid the interceptor attaching the old bad token
                
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                if (response.data.success) {
                    const { accessToken } = response.data;
                    localStorage.setItem('accessToken', accessToken);
                    
                    // Update authorization header with new token
                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, clear token and redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('cognitolearn-user'); // Clear legacy mock data too if any
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
