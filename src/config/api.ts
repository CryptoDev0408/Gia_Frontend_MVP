import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gia-backend-mvp.vercel.app/api/v1';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://gia-backend-mvp.vercel.app';

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

	// Blogs endpoints
	BLOGS: `${API_BASE_URL}/blogs`,
	BLOGS_SCRAPE: `${API_BASE_URL}/blogs/scrape`,
	BLOG_APPROVE: (id: number) => `${API_BASE_URL}/blogs/${id}/approve`,
	BLOG_DELETE: (id: number) => `${API_BASE_URL}/blogs/${id}`,
	BLOG_LIKE: (id: number) => `${API_BASE_URL}/blogs/${id}/like`,
	BLOG_COMMENTS: (id: number) => `${API_BASE_URL}/blogs/${id}/comments`,
	BLOG_COMMENT_DELETE: (blogId: number, commentId: number) => `${API_BASE_URL}/blogs/${blogId}/comments/${commentId}`,

	// Users endpoints (Admin only)
	USERS: `${API_BASE_URL}/users`,

	// Admin endpoints
	ADMIN_SCRAPE_FASHION: `${API_BASE_URL}/admin/scrape/fashion`,
	ADMIN_INSIGHTS: `${API_BASE_URL}/admin/insights`,
	ADMIN_STATS: `${API_BASE_URL}/admin/stats`,
};

// Create axios instance with default config
export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: false,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
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

// Add response interceptor for error handling
apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// If 401 and not already retried, try to refresh token
		// Only attempt refresh if we actually had a token (authenticated request)
		if (error.response?.status === 401 && !originalRequest._retry) {
			const hasToken = localStorage.getItem('accessToken');

			// Only try to refresh if we had a token in the first place
			if (hasToken) {
				originalRequest._retry = true;

				try {
					const refreshToken = localStorage.getItem('refreshToken');
					if (refreshToken) {
						const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
							refreshToken,
						});

						const { accessToken } = response.data.data;
						localStorage.setItem('accessToken', accessToken);

						originalRequest.headers.Authorization = `Bearer ${accessToken}`;
						return apiClient(originalRequest);
					}
				} catch (refreshError) {
					// Refresh failed, clear auth data
					localStorage.removeItem('accessToken');
					localStorage.removeItem('refreshToken');
					localStorage.removeItem('user');
					window.location.href = '/login';
				}
			}
		}

		return Promise.reject(error);
	}
);

export { API_BASE_URL, BACKEND_URL };
