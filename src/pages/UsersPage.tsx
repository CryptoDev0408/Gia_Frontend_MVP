import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, ArrowDownTrayIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { apiClient, API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';

interface User {
	id: number;
	email: string | null;
	username: string | null;
}

export const UsersPage: React.FC = () => {
	const { user } = useAuth();
	const isAdmin = user?.role === 'ADMIN';

	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState<Record<number, boolean>>({});

	useEffect(() => {
		if (isAdmin) {
			fetchUsers();
		} else {
			setLoading(false);
		}
	}, [isAdmin]);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await apiClient.get(API_ENDPOINTS.USERS);
			console.log('[UsersPage] Users fetched:', response.data.data.users.length);

			setUsers(response.data.data.users);
		} catch (err: any) {
			console.error('[UsersPage] Failed to fetch users:', err);
			setError(err.response?.data?.error || 'Failed to load users');
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteUser = async (userId: number) => {
		// Confirmation dialog
		const confirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
		if (!confirmed) return;

		try {
			setDeleteLoading(prev => ({ ...prev, [userId]: true }));

			await apiClient.delete(`${API_ENDPOINTS.USERS}/${userId}`);
			console.log('[UsersPage] User deleted:', userId);

			// Remove from local state
			setUsers(prev => prev.filter(u => u.id !== userId));
		} catch (err: any) {
			console.error('[UsersPage] Failed to delete user:', err);
			alert(err.response?.data?.error || 'Failed to delete user');
		} finally {
			setDeleteLoading(prev => ({ ...prev, [userId]: false }));
		}
	};

	const handleExportToExcel = () => {
		// Prepare data for export
		const exportData = users.map((user, index) => ({
			No: index + 1,
			Username: user.username || 'N/A',
			Email: user.email || 'N/A',
		}));

		// Create worksheet
		const worksheet = XLSX.utils.json_to_sheet(exportData);

		// Create workbook
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

		// Download file
		const fileName = `GIA_Users_${new Date().toISOString().split('T')[0]}.xlsx`;
		XLSX.writeFile(workbook, fileName);

		console.log('[UsersPage] Exported users to Excel:', fileName);
	};

	// Non-admin access denied view
	if (!isAdmin) {
		return (
			<div className="min-h-screen bg-brand-bg pt-20 flex items-center justify-center px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="max-w-md w-full bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl border border-red-500/30 backdrop-blur-sm p-8 text-center"
				>
					<ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
					<h2 className="text-2xl text-gradient mb-3">Access Denied</h2>
					<p className="text-brand-secondary text-base leading-relaxed">
						You do not have permission to access this page. This area is restricted to administrators only.
					</p>
				</motion.div>
			</div>
		);
	}

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen bg-brand-bg pt-20 flex items-center justify-center">
				<div className="text-center">
					<ArrowPathIcon className="w-12 h-12 text-brand-accent animate-spin mx-auto mb-4" />
					<p className="text-brand-secondary">Loading users...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="min-h-screen bg-brand-bg pt-20 flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-400 mb-4">⚠️ {error}</p>
					<button
						onClick={fetchUsers}
						className="px-6 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/80 transition-all"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-brand-bg pt-20 pb-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				{/* Page Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8 mt-4 text-center"
				>
					<h1 className="text-4xl text-gradient mb-2">All Subscribed Emails</h1>
					<p className="text-brand-secondary">Crucial Keys for Marketing</p>
				</motion.div>

				{/* Controls Bar */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="flex items-center justify-between mb-6 flex-wrap gap-4"
				>
					{/* Export Button */}
					<motion.button
						onClick={handleExportToExcel}
						disabled={users.length === 0}
						whileHover={{ scale: users.length === 0 ? 1 : 1.05 }}
						whileTap={{ scale: users.length === 0 ? 1 : 0.95 }}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all select-none ${users.length === 0
							? 'bg-brand-secondary/20 text-brand-secondary/50 cursor-not-allowed'
							: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 hover:from-green-500/40 hover:to-emerald-500/40 hover:text-green-300 cursor-pointer border border-green-500/30 hover:border-green-400/50'
							}`}
					>
						<ArrowDownTrayIcon className="w-5 h-5" />
						Export to Excel
					</motion.button>

					{/* Refresh Button */}
					<motion.button
						onClick={fetchUsers}
						disabled={loading}
						whileHover={{ scale: loading ? 1 : 1.05 }}
						whileTap={{ scale: loading ? 1 : 0.95 }}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all select-none ${loading
							? 'bg-brand-secondary/30 text-brand-secondary/70 cursor-not-allowed border border-brand-secondary/20'
							: 'bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary/20 cursor-pointer border border-brand-secondary/20'
							}`}
					>
						<ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
						Refresh
					</motion.button>
				</motion.div>

				{/* Users Table */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-gradient-to-br from-brand-secondary/10 to-brand-accent/10 rounded-2xl border border-brand-secondary/20 backdrop-blur-sm overflow-hidden"
				>
					{users.length === 0 ? (
						<div className="text-center py-20">
							<p className="text-brand-secondary text-lg">No users found</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								{/* Table Header */}
								<thead>
									<tr className="border-b border-brand-secondary/20">
										<th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent">No</th>
										<th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent">Username</th>
										<th className="px-6 py-4 text-left text-sm font-semibold text-brand-accent">Email</th>
										<th className="px-6 py-4 text-center text-sm font-semibold text-brand-accent">Action</th>
									</tr>
								</thead>

								{/* Table Body */}
								<tbody>
									{users.map((user, index) => (
										<motion.tr
											key={user.id}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.05 }}
											className="border-b border-brand-secondary/10 hover:bg-brand-secondary/5 transition-colors"
										>
											<td className="px-6 py-4 text-sm text-white">{index + 1}</td>
											<td className="px-6 py-4 text-sm text-white">
												{user.username || <span className="text-brand-secondary/60 italic">N/A</span>}
											</td>
											<td className="px-6 py-4 text-sm text-white">
												{user.email || <span className="text-brand-secondary/60 italic">N/A</span>}
											</td>
											<td className="px-6 py-4 text-center">
												<motion.button
													onClick={() => handleDeleteUser(user.id)}
													disabled={deleteLoading[user.id]}
													whileHover={{ scale: deleteLoading[user.id] ? 1 : 1.05 }}
													whileTap={{ scale: deleteLoading[user.id] ? 1 : 0.95 }}
													className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${deleteLoading[user.id]
														? 'bg-red-500/20 text-red-400/50 cursor-not-allowed'
														: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 hover:from-red-500/40 hover:to-rose-500/40 hover:text-red-300 cursor-pointer border border-red-500/30 hover:border-red-400/50'
														}`}
												>
													<TrashIcon className={`w-4 h-4 ${deleteLoading[user.id] ? 'animate-pulse' : ''}`} />
													{deleteLoading[user.id] ? 'Deleting...' : 'Delete'}
												</motion.button>
											</td>
										</motion.tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</motion.div>

				{/* Total Count */}
				{users.length > 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="mt-4 text-center text-sm text-brand-secondary"
					>
						Total Users: <span className="text-brand-accent font-semibold">{users.length}</span>
					</motion.div>
				)}
			</div>
		</div>
	);
};
