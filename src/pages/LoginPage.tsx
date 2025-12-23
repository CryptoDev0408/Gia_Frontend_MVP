import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const LoginPage: React.FC = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const { login, register } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

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
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
			<div className="max-w-md w-full">
				{/* Card */}
				<div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
					{/* Logo/Title */}
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
							GIA Fashion
						</h1>
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
						<Button
							type="submit"
							disabled={isLoading}
							className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<span className="flex items-center justify-center">
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									{isLogin ? 'Signing in...' : 'Creating account...'}
								</span>
							) : (
								isLogin ? 'Sign In' : 'Sign Up'
							)}
						</Button>
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
