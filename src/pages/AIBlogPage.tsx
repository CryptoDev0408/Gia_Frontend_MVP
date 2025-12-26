import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftIcon, ChevronDownIcon, ArrowLeftIcon, ArrowPathIcon, BoltIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { apiClient, API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

// Blog interface matching database structure
interface Blog {
	id: number;
	platform: string;
	title: string;
	description: string;
	ai_insight: string;
	image: string;
	link: string;
	approved: number;
	createdAt: string;
	updatedAt: string;
	likesCount: number;
	isLiked: boolean;
}

export const AIBlogPage: React.FC = () => {
	const { user } = useAuth();
	const isAdmin = user?.role === 'ADMIN';

	const [blogs, setBlogs] = useState<Blog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [scraping, setScraping] = useState(false);
	const [scrapingMessage, setScrapingMessage] = useState<string>('');
	const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
	const [likeLoading, setLikeLoading] = useState<Record<number, boolean>>({});

	const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
	const [commentBoxOpen, setCommentBoxOpen] = useState<number | null>(null);
	const [comments, setComments] = useState<Record<number, string>>({});
	const [viewMode] = useState<'row' | 'grid'>('grid'); // Fixed to grid layout
	const [selectedCard, setSelectedCard] = useState<Blog | null>(null);
	const [blogFilter, setBlogFilter] = useState<'all' | 'draft' | 'published'>('all'); // Admin filter
	const [expandedInsight, setExpandedInsight] = useState(false);

	// Fetch blogs from backend
	useEffect(() => {
		fetchBlogs();
	}, [isAdmin]); // Refetch when admin status changes

	const fetchBlogs = async () => {
		try {
			setLoading(true);
			setError(null);

			// Log user authentication status
			console.log('[AIBlogPage] Fetching blogs:', {
				isAuthenticated: !!user,
				userRole: user?.role,
				isAdmin,
				includeUnapproved: isAdmin ? 'true' : 'false'
			});

			// Admins can see unapproved blogs with includeUnapproved=true
			// Regular users only see approved blogs (approved=1)
			const includeUnapproved = isAdmin ? 'true' : 'false';
			const response = await apiClient.get(`${API_ENDPOINTS.BLOGS}?includeUnapproved=${includeUnapproved}`);

			console.log("AAAAAAAAAAAAAAAAAAAAAAAAA : ", response.data.data.blogs)

			console.log('[AIBlogPage] Blogs fetched successfully:', response.data.data.blogs.length, 'blogs');
			setBlogs(response.data.data.blogs);
		} catch (err: any) {
			console.error('[AIBlogPage] Failed to fetch blogs:', {
				error: err,
				response: err.response?.data,
				status: err.response?.status,
				message: err.message
			});
			setError(err.response?.data?.error || 'Failed to load blogs');
		} finally {
			setLoading(false);
		}
	};

	const handleScraping = async () => {
		try {
			setScraping(true);
			setScrapingMessage('Starting scraping workflow...');
			setError(null);

			const response = await apiClient.post(API_ENDPOINTS.BLOGS_SCRAPE);

			if (response.data.success) {
				const data = response.data.data;
				setScrapingMessage(`✅ Scraped ${data.scraped} articles, normalized ${data.normalized}, saved ${data.saved} to database`);

				// Wait a moment then refresh blogs
				setTimeout(() => {
					fetchBlogs();
					setScrapingMessage('');
				}, 2000);
			} else {
				setError('Scraping failed');
			}
		} catch (err: any) {
			console.error('Scraping failed:', err);
			setError(err.response?.data?.error || 'Scraping failed. Please try again.');
			setScrapingMessage('');
		} finally {
			setScraping(false);
		}
	};

	const handleApproveBlog = async (blogId: number) => {
		try {
			console.log(`[AIBlogPage] Approving blog ${blogId}...`, {
				isAdmin,
				userRole: user?.role,
				userId: user?.id
			});

			setActionLoading(prev => ({ ...prev, [blogId]: true }));

			const response = await apiClient.patch(API_ENDPOINTS.BLOG_APPROVE(blogId));

			console.log(`[AIBlogPage] Blog ${blogId} approved successfully:`, response.data);

			// Update local state
			setBlogs(prev => prev.map(blog =>
				blog.id === blogId ? { ...blog, approved: 1 } : blog
			));
		} catch (err: any) {
			console.error(`[AIBlogPage] Failed to approve blog ${blogId}:`, {
				error: err,
				response: err.response?.data,
				status: err.response?.status
			});
			setError(err.response?.data?.error || 'Failed to approve blog. Admin access required.');
		} finally {
			setActionLoading(prev => ({ ...prev, [blogId]: false }));
		}
	};

	const handleRemoveBlog = async (blogId: number) => {
		if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
			return;
		}
		try {
			setActionLoading(prev => ({ ...prev, [blogId]: true }));
			await apiClient.delete(API_ENDPOINTS.BLOG_DELETE(blogId));
			// Remove from local state
			setBlogs(prev => prev.filter(blog => blog.id !== blogId));
		} catch (err: any) {
			console.error('Failed to remove blog:', err);
			setError(err.response?.data?.error || 'Failed to remove blog');
		} finally {
			setActionLoading(prev => ({ ...prev, [blogId]: false }));
		}
	};

	const toggleExpand = (blogId: number) => {
		setExpandedCards(prev => {
			const newSet = new Set(prev);
			if (newSet.has(blogId)) {
				newSet.delete(blogId);
			} else {
				newSet.add(blogId);
			}
			return newSet;
		});
	};

	const toggleLike = async (blogId: number) => {
		// Check if user is authenticated
		if (!user) {
			alert('Please log in to like articles');
			return;
		}

		try {
			setLikeLoading(prev => ({ ...prev, [blogId]: true }));

			// Find current blog to check like status
			const currentBlog = blogs.find(b => b.id === blogId);
			if (!currentBlog) return;

			if (currentBlog.isLiked) {
				// Unlike the blog
				const response = await apiClient.delete(API_ENDPOINTS.BLOG_LIKE(blogId));
				if (response.data.success) {
					// Update local state
					setBlogs(prev => prev.map(blog =>
						blog.id === blogId
							? { ...blog, isLiked: false, likesCount: response.data.data.likesCount }
							: blog
					));
					// Update selectedCard if it's the same blog
					if (selectedCard && selectedCard.id === blogId) {
						setSelectedCard({ ...selectedCard, isLiked: false, likesCount: response.data.data.likesCount });
					}
				}
			} else {
				// Like the blog
				const response = await apiClient.post(API_ENDPOINTS.BLOG_LIKE(blogId));
				if (response.data.success) {
					// Update local state
					setBlogs(prev => prev.map(blog =>
						blog.id === blogId
							? { ...blog, isLiked: true, likesCount: response.data.data.likesCount }
							: blog
					));
					// Update selectedCard if it's the same blog
					if (selectedCard && selectedCard.id === blogId) {
						setSelectedCard({ ...selectedCard, isLiked: true, likesCount: response.data.data.likesCount });
					}
				}
			}
		} catch (err: any) {
			console.error('Failed to toggle like:', err);
			const errorMsg = err.response?.data?.error || 'Failed to update like status';
			if (err.response?.status === 401) {
				alert('Please log in to like articles');
			} else if (err.response?.status === 400 && errorMsg.includes('already liked')) {
				// Already liked, refresh to sync state
				fetchBlogs();
			} else {
				alert(errorMsg);
			}
		} finally {
			setLikeLoading(prev => ({ ...prev, [blogId]: false }));
		}
	};

	const handleComment = (blogId: number) => {
		// Check if user is authenticated
		if (!user) {
			alert('Please log in to comment on articles');
			return;
		}

		const comment = comments[blogId];
		if (comment?.trim()) {
			console.log('Comment submitted:', { blogId, comment });
			// TODO: Backend integration for comments
			alert('Comment posted! (Mock - will integrate with backend later)');
			setComments(prev => ({ ...prev, [blogId]: '' }));
			setCommentBoxOpen(null);
		}
	};

	const handleCommentButtonClick = (blogId: number, e?: React.MouseEvent) => {
		if (e) {
			e.stopPropagation();
		}

		// Check if user is authenticated
		if (!user) {
			alert('Please log in to comment on articles');
			return;
		}

		setCommentBoxOpen(commentBoxOpen === blogId ? null : blogId);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

		if (diffHours < 1) return 'Just now';
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	};

	// Filter blogs based on admin filter selection
	const filteredBlogs = isAdmin
		? blogs.filter(blog => {
			if (blogFilter === 'draft') return blog.approved === 0;
			if (blogFilter === 'published') return blog.approved === 1;
			return true; // 'all'
		})
		: blogs.filter(blog => blog.approved === 1); // Regular users only see published

	if (loading) {
		return (
			<div className="min-h-screen bg-brand-bg pt-20 flex items-center justify-center">
				<div className="text-center">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full mx-auto mb-4"
					/>
					<p className="text-brand-secondary">Loading fashion trends...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-brand-bg pt-20 flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-400 mb-4">⚠️ {error}</p>
					<button
						onClick={fetchBlogs}
						className="px-6 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/80 transition-all"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-brand-bg pt-20">
			{/* Full Detail View */}
			<AnimatePresence>
				{selectedCard && (
					<>
						{/* Backdrop Overlay */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
							onClick={() => setSelectedCard(null)}
						/>

						{/* Detail Panel */}
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 50 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 50 }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
							className="fixed inset-0 z-50 overflow-y-auto"
						>
							<div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
								<div className="max-w-4xl mx-auto">
									{/* Back Button */}
									<motion.button
										onClick={() => setSelectedCard(null)}
										whileHover={{ scale: 1.05, x: -5 }}
										whileTap={{ scale: 0.95 }}
										className="flex items-center gap-2 mb-6 text-brand-accent hover:text-white transition-colors"
									>
										<ArrowLeftIcon className="w-5 h-5" />
										<span>Back to Trends</span>
									</motion.button>

									{/* Full Card Detail */}
									<motion.div
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										className="bg-gradient-to-br from-brand-secondary/10 to-brand-accent/10 rounded-2xl border border-brand-secondary/20 backdrop-blur-sm p-8"
									>
										{/* Title and Top Actions */}
										<div className="flex items-start justify-between mb-6">
											<div className="flex-1">
												<h2 className="text-3xl text-gradient mb-3">{selectedCard.title}</h2>
												{/* <div className="px-4 py-2 bg-black text-white rounded-lg uppercase text-sm hover:bg-brand-accent hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg inline-block">
													{selectedCard.platform}
												</div> */}
											</div>

											{/* Admin Controls - Top Right */}
											{isAdmin && (
												<div className="flex items-center gap-2 ml-4">
													{selectedCard.approved === 0 && (
														<button
															onClick={() => { handleApproveBlog(selectedCard.id); setSelectedCard(null); }}
															disabled={actionLoading[selectedCard.id]}
															className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-lg text-sm hover:from-green-500/40 hover:to-emerald-500/40 hover:text-green-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg hover:shadow-green-500/30 border border-green-500/30 hover:border-green-400/50"
														>
															<CheckIcon className="w-5 h-5" />
															Publish
														</button>
													)}
													{selectedCard.approved === 1 && (
														<span className="px-4 py-2 bg-brand-accent/20 text-brand-accent rounded-lg text-sm">
															Published
														</span>
													)}
													<button
														onClick={() => { handleRemoveBlog(selectedCard.id); setSelectedCard(null); }}
														disabled={actionLoading[selectedCard.id]}
														className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 rounded-lg text-sm hover:from-red-500/40 hover:to-rose-500/40 hover:text-red-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg hover:shadow-red-500/30 border border-red-500/30 hover:border-red-400/50"
													>
														<TrashIcon className="w-5 h-5" />
														Remove
													</button>
												</div>
											)}
										</div>

										{/* AI Insight */}
										<div className="mb-6">
											{/* <p className="text-xs text-brand-accent mb-1">AI INSIGHT</p> */}

											<div className="text-sm text-white leading-relaxed">
												{(() => {
													const sentences = selectedCard.ai_insight?.split(/(?<=\.)\s+/) || [];
													const displaySentences = expandedInsight ? sentences : sentences.slice(0, 2);

													return displaySentences.map((sentence, index) => (
														<span key={index}>
															{sentence}
															<br />
															<br />
														</span>
													));
												})()}
											</div>

											{selectedCard.ai_insight &&
												selectedCard.ai_insight.split(/(?<=\.)\s+/).length > 2 && (
													<button
														onClick={() => setExpandedInsight(!expandedInsight)}
														className="text-brand-accent text-xs mt-2 hover:underline"
													>
														{expandedInsight ? 'Show less' : 'Show more...'}
													</button>
												)}


											{/* Image */}
											{selectedCard.image && (
												<div className="mb-6">
													<img
														src={selectedCard.image}
														alt={selectedCard.title}
														className="w-full h-auto rounded-xl object-cover"
														onError={(e) => {
															e.currentTarget.style.display = 'none';
														}}
													/>
												</div>
											)}
										</div>


										{/* Description */}
										{/* <div className="mb-6">
											<p className="text-brand-secondary text-base leading-relaxed">{selectedCard.description}</p>
										</div> */}


										{/* Bottom Action Buttons - Like, Comment, Original */}
										<div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-6 border-t border-brand-secondary/20">
											{/* Row 1: Like and Comment (on mobile: full row, on desktop: inline) */}
											<div className="flex items-center gap-3 flex-1">
												<motion.button
													onClick={(e) => { e.stopPropagation(); toggleLike(selectedCard.id); }}
													disabled={likeLoading[selectedCard.id]}
													whileHover={{ scale: likeLoading[selectedCard.id] ? 1 : 1.1 }}
													whileTap={{ scale: likeLoading[selectedCard.id] ? 1 : 0.9 }}
													className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-transparent to-transparent hover:from-red-500/20 hover:to-pink-500/20 border border-brand-secondary/30 hover:border-red-500/50 transition-all duration-300 group shadow-md hover:shadow-red-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
												>
													{selectedCard.isLiked ? (
														<HeartSolidIcon className="w-5 h-5 text-red-500" />
													) : (
														<HeartIcon className="w-5 h-5 text-brand-secondary group-hover:text-red-500 transition-colors" />
													)}
													<span className="text-sm text-brand-secondary group-hover:text-white transition-colors">
														{likeLoading[selectedCard.id] ? 'Loading...' : `Like (${selectedCard.likesCount})`}
													</span>
												</motion.button>

												<motion.button
													onClick={() => handleCommentButtonClick(selectedCard.id)}
													whileTap={{ scale: 0.9 }}
													className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-transparent to-transparent hover:from-brand-accent/20 hover:to-blue-500/20 border border-brand-secondary/30 hover:border-brand-accent/50 transition-all duration-300 group shadow-md hover:shadow-brand-accent/30 cursor-pointer"
												>
													<ChatBubbleLeftIcon className="w-5 h-5 text-brand-secondary group-hover:text-brand-accent transition-colors" />
													<span className="text-sm text-brand-secondary group-hover:text-white transition-colors">Comment</span>
												</motion.button>
											</div>

											{/* Row 2: Read Article (on mobile: full row, on desktop: right side) */}
											{/* <motion.a
												href={selectedCard.link}
												target="_blank"
												rel="noopener noreferrer"
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg transition-all duration-300 text-sm shadow-xl w-full md:w-auto"
												style={{
													backgroundColor: '#1f6153'
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.backgroundColor = '#0b3539';
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.backgroundColor = '#1f6153';
												}}
											>
												<span>Read Article</span>
												<span>→</span>
											</motion.a> */}
										</div>

										{/* Comment Box */}
										<AnimatePresence>
											{commentBoxOpen === selectedCard.id && (
												<motion.div
													initial={{ opacity: 0, height: 0 }}
													animate={{ opacity: 1, height: 'auto' }}
													exit={{ opacity: 0, height: 0 }}
													transition={{ duration: 0.2 }}
													className="mt-4 pt-4 border-t border-brand-secondary/20"
												>
													<div className="flex gap-2">
														<input
															type="text"
															value={comments[selectedCard.id] || ''}
															onChange={(e) => setComments(prev => ({ ...prev, [selectedCard.id]: e.target.value }))}
															placeholder="Add a comment..."
															className="flex-1 px-3 py-2 bg-brand-bg/70 border border-brand-secondary/20 rounded-lg text-white text-sm placeholder-brand-secondary focus:border-brand-accent focus:outline-none transition-all"
															onKeyPress={(e) => e.key === 'Enter' && handleComment(selectedCard.id)}
														/>
														<motion.button
															onClick={() => handleComment(selectedCard.id)}
															whileHover={{ scale: 1.05 }}
															whileTap={{ scale: 0.95 }}
															className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-lg text-sm transition-all"
														>
															Post
														</motion.button>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</motion.div>
								</div>
							</div>
						</motion.div >
					</>
				)}
			</AnimatePresence >

			{/* Main Content Section */}
			< section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" >
				{/* Admin Filter Section */}
				{
					isAdmin && (
						<div className="flex flex-wrap gap-3 justify-center items-center mb-6">
							<button
								onClick={() => setBlogFilter('draft')}
								className={`px-4 py-2 rounded-lg text-sm transition-all cursor-pointer select-none ${blogFilter === 'draft'
									? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
									: 'bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary/20 border border-brand-secondary/20'
									}`}
							>
								Draft ({blogs.filter(b => b.approved === 0).length})
							</button>
							<button
								onClick={() => setBlogFilter('published')}
								className={`px-4 py-2 rounded-lg text-sm transition-all cursor-pointer select-none ${blogFilter === 'published'
									? 'bg-green-500/20 text-green-400 border border-green-500/50'
									: 'bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary/20 border border-brand-secondary/20'
									}`}
							>
								Published ({blogs.filter(b => b.approved === 1).length})
							</button>
							<button
								onClick={() => setBlogFilter('all')}
								className={`px-4 py-2 rounded-lg text-sm transition-all cursor-pointer select-none ${blogFilter === 'all'
									? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
									: 'bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary/20 border border-brand-secondary/20'
									}`}
							>
								All Blogs ({blogs.length})
							</button>
						</div>
					)
				}

				<div className="flex items-center justify-between flex-wrap gap-4 mb-8">
					{/* Right Side Buttons */}
					<div className="flex items-center gap-3 flex-wrap ml-auto">
						{/* Scraping Button - Admin Only */}
						{isAdmin && (
							<motion.button
								onClick={handleScraping}
								disabled={scraping}
								whileHover={{ scale: scraping ? 1 : 1.05 }}
								whileTap={{ scale: scraping ? 1 : 0.95 }}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all select-none ${scraping
									? 'bg-brand-secondary/30 text-brand-secondary/70 cursor-not-allowed border border-brand-secondary/20'
									: 'bg-gradient-to-r from-brand-accent to-pink-500 text-white hover:from-brand-accent/80 hover:to-pink-400 cursor-pointer border border-brand-accent/50'
									}`}
							>
								<BoltIcon className={`w-4 h-4 ${scraping ? 'animate-pulse' : ''}`} />
								{scraping ? 'Scraping...' : 'Start Scraping'}
							</motion.button>
						)}

						{/* Refresh Button */}
						<motion.button
							onClick={fetchBlogs}
							disabled={loading || scraping}
							whileHover={{ scale: loading || scraping ? 1 : 1.05 }}
							whileTap={{ scale: loading || scraping ? 1 : 0.95 }}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all select-none ${loading || scraping
								? 'bg-brand-secondary/30 text-brand-secondary/70 cursor-not-allowed border border-brand-secondary/20'
								: 'bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary/20 cursor-pointer border border-brand-secondary/20'
								}`}
						>
							<ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
							Refresh
						</motion.button>
					</div>
				</div>

				{/* Scraping Status Message */}
				{
					scrapingMessage && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-6 p-4 bg-brand-accent/10 border border-brand-accent/30 rounded-xl text-brand-accent text-sm"
						>
							{scrapingMessage}
						</motion.div>
					)
				}

				{
					filteredBlogs.length === 0 ? (
						<div className="text-center py-20">
							<p className="text-brand-secondary text-lg mb-2">
								{blogs.length === 0 ? 'No fashion trends available yet.' : `No ${blogFilter} blogs found.`}
							</p>
							{blogs.length === 0 && isAdmin && (
								<p className="text-brand-secondary/60 text-sm">Click "Start Scraping" to fetch the latest trends!</p>
							)}
						</div>
					) : (
						<div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
							{filteredBlogs.map((blog, index) => {
								const isExpanded = expandedCards.has(blog.id);

								// Grid Mode
								if (viewMode === 'grid') {
									return (
										<motion.div
											key={blog.id}
											initial={{ opacity: 0, y: 50 }}
											whileInView={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3 }}
											viewport={{ once: true }}
											onClick={() => {
												console.log("BBBBBBBBBBBBBBB : ", blog)
												setSelectedCard(blog);
												setExpandedInsight(false);
											}}
											className="bg-gradient-to-br from-brand-secondary/10 to-brand-accent/10 rounded-2xl border border-brand-secondary/20 p-5 cursor-pointer hover:border-brand-accent/40"
										>									{/* Admin Controls */}
											{isAdmin && (
												<div className="flex items-center justify-end gap-2 mb-3">
													{blog.approved === 0 && (
														<button
															onClick={(e) => { e.stopPropagation(); handleApproveBlog(blog.id); }}
															disabled={actionLoading[blog.id]}
															className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-lg text-xs font-semibold hover:from-green-500/40 hover:to-emerald-500/40 hover:text-green-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md hover:shadow-green-500/30 border border-green-500/30 hover:border-green-400/50"
														>
															<CheckIcon className="w-4 h-4" />
															Publish
														</button>
													)}
													{blog.approved === 1 && (
														<span className="px-3 py-1.5 bg-brand-accent/20 text-brand-accent rounded-lg text-xs font-semibold">
															Published
														</span>
													)}
													<button
														onClick={(e) => { e.stopPropagation(); handleRemoveBlog(blog.id); }}
														disabled={actionLoading[blog.id]}
														className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 rounded-lg text-xs font-semibold hover:from-red-500/40 hover:to-rose-500/40 hover:text-red-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md hover:shadow-red-500/30 border border-red-500/30 hover:border-red-400/50"
													>
														<TrashIcon className="w-4 h-4" />
														Remove
													</button>
												</div>
											)}										<h2 className="text-xl text-gradient mb-3">{blog.title}</h2>
											{/* <span className="inline-block px-3 py-1.5 bg-black text-white rounded-lg uppercase text-xs hover:bg-brand-accent hover:scale-105 transition-all duration-300 cursor-pointer shadow-md mb-3">{blog.platform}</span> */}
											{blog.image && (
												<img src={blog.image} alt={blog.title} className="w-full h-48 object-cover rounded-lg mt-3 mb-3" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
											)}

											{/* User Operations */}
											<div className="flex items-center gap-4 pt-3 border-t border-brand-secondary/20">
												<button
													onClick={(e) => { e.stopPropagation(); toggleLike(blog.id); }}
													disabled={likeLoading[blog.id]}
													className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-brand-secondary hover:text-white hover:bg-brand-accent/20 transition-all duration-300 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
												>
													{blog.isLiked ? <HeartSolidIcon className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5" />}
													<span className="text-xs font-semibold">
														{likeLoading[blog.id] ? 'Loading...' : `Like (${blog.likesCount})`}
													</span>
												</button>
												<button
													onClick={(e) => handleCommentButtonClick(blog.id, e)}
													className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-brand-secondary hover:text-white hover:bg-brand-accent/20 transition-all duration-300 hover:scale-105 cursor-pointer"
												>
													<ChatBubbleLeftIcon className="w-5 h-5" />
													<span className="text-xs font-semibold">Comment</span>
												</button>
												<div className="flex-1"></div>
												{/* <a
													href={blog.link}
													target="_blank"
													rel="noopener noreferrer"
													onClick={(e) => e.stopPropagation()}
													className="flex items-center gap-1 px-3 py-2 text-white rounded-lg transition-all duration-300 text-xs shadow-lg hover:scale-105 cursor-pointer"
													style={{
														backgroundColor: '#1f6153'
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.backgroundColor = '#0b3539';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.backgroundColor = '#1f6153';
													}}
												>
													<span>Read Article</span>
													<span>→</span>
												</a> */}
											</div>
										</motion.div>
									);
								}

								// Row Mode
								return (
									<motion.div
										key={blog.id}
										initial={{ opacity: 0, y: 50 }}
										whileInView={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: index * 0.1 }}
										viewport={{ once: true }}
										className="bg-gradient-to-br from-brand-secondary/10 to-brand-accent/10 rounded-2xl border border-brand-secondary/20 overflow-hidden"
									>
										<div className="p-6">
											<div className="flex items-start justify-between mb-4">
												<h2 className="text-2xl text-gradient font-bold flex-1">{blog.title}</h2>
												<div className="flex items-center gap-2 ml-3">
													{/* <span className="px-3 py-1 bg-brand-accent/20 text-brand-accent rounded-full text-xs font-semibold uppercase">{blog.platform}</span> */}
													{/* Admin Controls */}
													{isAdmin && (
														<>
															{blog.approved === 0 && (
																<button
																	onClick={() => handleApproveBlog(blog.id)}
																	disabled={actionLoading[blog.id]}
																	className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-lg text-xs font-semibold hover:from-green-500/40 hover:to-emerald-500/40 hover:text-green-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md hover:shadow-green-500/30 border border-green-500/30 hover:border-green-400/50"
																>
																	<CheckIcon className="w-4 h-4" />
																	Publish
																</button>
															)}
															{blog.approved === 1 && (
																<span className="px-3 py-1.5 bg-brand-accent/20 text-brand-accent rounded-lg text-xs font-semibold">
																	Published
																</span>
															)}
															<button
																onClick={() => handleRemoveBlog(blog.id)}
																disabled={actionLoading[blog.id]}
																className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 rounded-lg text-xs font-semibold hover:from-red-500/40 hover:to-rose-500/40 hover:text-red-300 hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md hover:shadow-red-500/30 border border-red-500/30 hover:border-red-400/50"
															>
																<TrashIcon className="w-4 h-4" />
																Remove
															</button>
														</>
													)}
												</div>
											</div>
											<p className="text-brand-secondary text-sm mb-4">{blog.description}</p>
											<div className="bg-brand-bg/50 rounded-xl p-4 border border-brand-accent/30 mb-4">
												{/* <p className="text-xs text-brand-accent font-semibold mb-1">🤖 AI INSIGHT</p> */}
												<p className={`text-sm text-white ${!isExpanded ? 'line-clamp-2' : ''}`}>{blog.ai_insight}</p>
											</div>
											<span className="text-xs text-brand-secondary">{formatDate(blog.createdAt)}</span>
										</div>

										<div className="px-6 pb-4">
											<button
												onClick={() => toggleExpand(blog.id)}
												className="w-full py-3 bg-brand-accent/20 text-brand-accent rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
											>
												{isExpanded ? 'Show Less' : 'View Details'}
												<ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
											</button>
										</div>

										<AnimatePresence>
											{isExpanded && (
												<motion.div
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: 'auto', opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													className="px-6 pb-6 border-t border-brand-secondary/20"
												>
													{blog.image && (
														<img src={blog.image} alt={blog.title} className="w-full h-64 object-cover rounded-lg my-4" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
													)}
													<a href={blog.link} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-6 py-3 bg-brand-accent text-white rounded-lg mb-4 font-semibold cursor-pointer">
														View Original →
													</a>
													<div className="flex items-center justify-center gap-4 pt-4 border-t border-brand-secondary/20">
														<button
															onClick={() => toggleLike(blog.id)}
															disabled={likeLoading[blog.id]}
															className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
														>
															{blog.isLiked ? <HeartSolidIcon className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5 text-brand-secondary" />}
															<span className="text-sm text-brand-secondary">
																{likeLoading[blog.id] ? 'Loading...' : `Like (${blog.likesCount})`}
															</span>
														</button>
														<button onClick={() => handleCommentButtonClick(blog.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10 transition-colors cursor-pointer">
															<ChatBubbleLeftIcon className="w-5 h-5 text-brand-secondary" />
															<span className="text-sm text-brand-secondary">Comment</span>
														</button>
													</div>
													<AnimatePresence>
														{commentBoxOpen === blog.id && (
															<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-brand-secondary/20">
																<div className="flex gap-2">
																	<input
																		type="text"
																		value={comments[blog.id] || ''}
																		onChange={(e) => setComments(prev => ({ ...prev, [blog.id]: e.target.value }))}
																		placeholder="Add a comment..."
																		className="flex-1 px-3 py-2 bg-brand-bg/70 border border-brand-secondary/20 rounded-lg text-white text-sm placeholder-brand-secondary focus:border-brand-accent focus:outline-none"
																		onKeyPress={(e) => e.key === 'Enter' && handleComment(blog.id)}
																	/>
																	<button onClick={() => handleComment(blog.id)} className="px-4 py-2 bg-brand-accent text-white rounded-lg font-semibold text-sm">
																		Post
																	</button>
																</div>
															</motion.div>
														)}
													</AnimatePresence>
												</motion.div>
											)}
										</AnimatePresence>
									</motion.div>
								);
							})}
						</div>
					)
				}
			</section >
		</div >
	);
};

export default AIBlogPage;
