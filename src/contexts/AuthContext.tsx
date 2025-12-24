import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../config/api';

interface User {
	id: string;
	email?: string;
	username?: string;
	role: string;
	walletAddress?: string;
}

interface AuthContextType {
	user: User | null;
	accessToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	showAuthModal: boolean;
	authModalMode: 'login' | 'register';
	openAuthModal: (mode?: 'login' | 'register') => void;
	closeAuthModal: () => void;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string, username?: string) => Promise<void>;
	logout: () => void;
	refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

	// Load auth data from localStorage on mount
	useEffect(() => {
		const loadAuth = () => {
			try {
				const storedToken = localStorage.getItem('accessToken');
				const storedUser = localStorage.getItem('user');

				if (storedToken && storedUser) {
					setAccessToken(storedToken);
					setUser(JSON.parse(storedUser));
					// Set default Authorization header
					apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
				}
			} catch (error) {
				console.error('Failed to load auth data:', error);
				localStorage.removeItem('accessToken');
				localStorage.removeItem('user');
			} finally {
				setIsLoading(false);
			}
		};

		loadAuth();
	}, []);

	const openAuthModal = (mode: 'login' | 'register' = 'login') => {
		setAuthModalMode(mode);
		setShowAuthModal(true);
	};

	const closeAuthModal = () => {
		setShowAuthModal(false);
	};

	const login = async (email: string, password: string) => {
		try {
			const response = await apiClient.post('/auth/login', { email, password });

			if (response.data.success) {
				const { user: userData, accessToken: token } = response.data.data;

				setUser(userData);
				setAccessToken(token);

				// Save to localStorage
				localStorage.setItem('accessToken', token);
				localStorage.setItem('user', JSON.stringify(userData));

				// Set default Authorization header
				apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

				// Close modal on success
				closeAuthModal();
			}
		} catch (error: any) {
			console.error('Login failed:', error);
			throw new Error(error.response?.data?.error || 'Login failed');
		}
	};

	const register = async (email: string, password: string, username?: string) => {
		try {
			const response = await apiClient.post('/auth/register', {
				email,
				password,
				username
			});

			if (response.data.success) {
				const { user: userData, accessToken: token, refreshToken } = response.data.data;

				setUser(userData);
				setAccessToken(token);

				// Save to localStorage
				localStorage.setItem('accessToken', token);
				localStorage.setItem('refreshToken', refreshToken);
				localStorage.setItem('user', JSON.stringify(userData));

				// Set default Authorization header
				apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

				// Close modal on success
				closeAuthModal();
			}
		} catch (error: any) {
			console.error('Registration failed:', error);
			throw new Error(error.response?.data?.error || 'Registration failed');
		}
	};

	const logout = () => {
		setUser(null);
		setAccessToken(null);

		// Clear localStorage
		localStorage.removeItem('accessToken');
		localStorage.removeItem('user');
		localStorage.removeItem('refreshToken');

		// Remove Authorization header
		delete apiClient.defaults.headers.common['Authorization'];
	};

	const refreshAuth = async () => {
		try {
			const refreshToken = localStorage.getItem('refreshToken');
			if (!refreshToken) {
				throw new Error('No refresh token');
			}

			const response = await apiClient.post('/auth/refresh', { refreshToken });

			if (response.data.success) {
				const { accessToken: newToken } = response.data.data;
				setAccessToken(newToken);
				localStorage.setItem('accessToken', newToken);
				apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
			}
		} catch (error) {
			console.error('Token refresh failed:', error);
			logout();
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				accessToken,
				isAuthenticated: !!user && !!accessToken,
				isLoading,
				showAuthModal,
				authModalMode,
				openAuthModal,
				closeAuthModal,
				login,
				register,
				logout,
				refreshAuth,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
