import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { isAuthenticated, isLoading, openAuthModal } = useAuth();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			openAuthModal('login');
		}
	}, [isLoading, isAuthenticated, openAuthModal]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
					<p className="mt-4 text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black">
				<div className="text-center">
					<p className="text-gray-400">Please sign in to continue</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
};

export default ProtectedRoute;
