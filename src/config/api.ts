// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api/v1';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5005';

export const API_ENDPOINTS = {
	// Auth endpoints
	LOGIN: `${API_BASE_URL}/auth/login`,
	REGISTER: `${API_BASE_URL}/auth/register`,
	REFRESH: `${API_BASE_URL}/auth/refresh`,

	// Posts endpoints
	POSTS: `${API_BASE_URL}/posts`,
	TRENDING_POSTS: `${API_BASE_URL}/posts/trending`,

	// Trends endpoints
	TRENDS: `${API_BASE_URL}/trends`,
	TREND_CLUSTERS: `${API_BASE_URL}/trends/clusters`,

	// Admin endpoints
	ADMIN_INSIGHTS: `${API_BASE_URL}/admin/insights`,
	ADMIN_STATS: `${API_BASE_URL}/admin/stats`,
};

export { API_BASE_URL, BACKEND_URL };
