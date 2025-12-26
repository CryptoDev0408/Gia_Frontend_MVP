import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [error, setError] = useState('');
	// const [isLoading, setIsLoading] = useState(false);

	const { login, register } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		// setIsLoading(true);

		try {
			if (isLogin) {
				await login(email, password);
			} else {
				await register(email, password, username);
			}
			navigate('/'); // Redirect to home after successful auth
		} catch (err: any) {
			setError(err.message || 'Authentication failed');
		} finally {
			// setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
			<div className="max-w-md w-full">
				{/* Card */}
				<div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
					{/* Logo/Title */}
					<div className="text-center mb-8">
						{/* <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
							GIA Fashion
						</h1> */}
						<div className="flex items-center justify-center mb-4">
							<img
								src="/logo.jpg"
								alt="GIA Token"
								className="h-20 w-20 object-contain opacity-90"
							/>
						</div>
						<p className="text-gray-400">
							{isLogin ? 'Sign in to your account' : 'Create a new account'}
						</p>
					</div>

					{/* Error Message */}
					{error && (
						<div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
							<p className="text-red-400 text-sm">{error}</p>
						</div>
					)}

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Username (only for registration) */}
						{!isLogin && (
							<div>
								<label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
									Username
								</label>
								<input
									id="username"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									className="w-full px-4 py-3 bg-black/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
									placeholder="Enter your username"
								/>
							</div>
						)}

						{/* Email */}
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
								Email
							</label>
							<input
								id="email"
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-3 bg-black/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
								placeholder="Enter your email"
							/>
						</div>

						{/* Password */}
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
								Password
							</label>
							<input
								id="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								minLength={6}
								className="w-full px-4 py-3 bg-black/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
								placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
							/>
						</div>

						{/* Submit Button */}

					</form>

					{/* Toggle between Login/Register */}
					<div className="mt-6 text-center">
						<button
							type="button"
							onClick={() => {
								setIsLogin(!isLogin);
								setError('');
							}}
							className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
						>
							{isLogin ? (
								<>
									Don't have an account? <span className="underline">Sign up</span>
								</>
							) : (
								<>
									Already have an account? <span className="underline">Sign in</span>
								</>
							)}
						</button>
					</div>

					{/* Divider */}
					<div className="mt-8 pt-6 border-t border-purple-500/20">
						<p className="text-center text-xs text-gray-500">
							By continuing, you agree to GIA's Terms of Service and Privacy Policy
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
