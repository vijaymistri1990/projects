import axios from 'axios'

const { apiEndpoint } = require('./commanApi')

// Create axios instance with default config
const service = axios.create({
    baseURL: apiEndpoint,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Helper function to get token from storage
const getAuthToken = () => {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            // Remove quotes if token is stored as JSON string
            return token.replace(/^"(.*)"$/, '$1');
        }
        return null;
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
}

// Helper function to get user data from storage
const getUserData = () => {
    try {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Request interceptor - automatically add token to all requests
service.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['authentication'] = token;
            console.log('Token added to request:', token.substring(0, 20) + '...'); // Debug log
        } else {
            console.log('No token found in localStorage'); // Debug log
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
)

// Response interceptor - handle errors globally
service.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            
            // Handle 401 Unauthorized - token expired or invalid
            if (status === 401 || data?.statusCode === 401) {
                console.log('Authentication failed, redirecting to login...');
                renewToken();
            }
            
            // Handle 400 Bad Request - token not found
            if (status === 400 && data?.message?.includes('token')) {
                console.log('Token not found, redirecting to login...');
                renewToken();
            }
        } else if (error.message === 'Network Error') {
            console.error('Network Error: Server is not responding');
        }
        
        return Promise.reject(error);
    }
)

/**
 * Clear authentication data and redirect to login
 */
const renewToken = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    
    // Also clear cookies if they exist
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to sign-in page
    window.location.href = '/login'
}

/**
 * Generic API call - automatically includes authentication token
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} path - API endpoint path
 * @param {object} payload - Request body data (for POST, PUT, DELETE)
 * @param {object} customHeaders - Additional custom headers (optional)
 */
export const ApiCall = async (method, path, payload = null, customHeaders = {}) => {
    try {
        const config = {
            method,
            url: path,
            headers: { ...customHeaders }
        };
        
        // Add payload to request body for POST, PUT, PATCH, and DELETE
        if (payload && (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')) {
            config.data = payload;
        }
        
        console.log(`Making ${method} request to ${path}`, payload ? 'with payload' : 'without payload'); // Debug log
        
        const response = await service.request(config);
        return response;
    } catch (error) {
        console.error(`API Call Error [${method} ${path}]:`, error.response?.data || error.message);
        
        // Return error response for handling in components
        if (error.response) {
            return error.response;
        }
        
        throw error;
    }
}

/**
 * GET request with authentication
 */
export const GetApiCall = async (path, customHeaders = {}) => {
    return ApiCall('GET', path, null, customHeaders);
}

/**
 * POST request with authentication
 */
export const PostApiCall = async (path, payload, customHeaders = {}) => {
    return ApiCall('POST', path, payload, customHeaders);
}

/**
 * PUT request with authentication
 */
export const PutApiCall = async (path, payload, customHeaders = {}) => {
    return ApiCall('PUT', path, payload, customHeaders);
}

/**
 * DELETE request with authentication
 */
export const DeleteApiCall = async (path, payload = null, customHeaders = {}) => {
    return ApiCall('DELETE', path, payload, customHeaders);
}

/**
 * Legacy support - UserApiCall (now just uses ApiCall with automatic token)
 */
export const UserApiCall = async (method, path, payload, header = null) => {
    return ApiCall(method, path, payload, header || {});
}

/**
 * Legacy support - GetUserApiCall (now just uses GetApiCall with automatic token)
 */
export const GetUserApiCall = async (method, path, header = null) => {
    return ApiCall(method, path, null, header || {});
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    const token = getAuthToken();
    const userData = getUserData();
    return !!(token && userData);
}

/**
 * Get current user data
 */
export const getCurrentUser = () => {
    return getUserData();
}

export default service;