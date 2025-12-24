import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, ChevronDownIcon, ArrowLeftIcon, ArrowPathIcon, BoltIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { apiClient, API_ENDPOINTS } from '../config/api';

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
}

export const AIBlogPage: React.FC = () => {
	const [blogs, setBlogs] = useState<Blog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [scraping, setScraping] = useState(false);
	const [scrapingMessage, setScrapingMessage] = useState<string>('');

	const [likedBlogs, setLikedBlogs] = useState<Set<number>>(new Set());
	const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
	const [commentBoxOpen, setCommentBoxOpen] = useState<number | null>(null);
	const [comments, setComments] = useState<Record<number, string>>({});
	const [viewMode] = useState<'row' | 'grid'>('grid'); // Fixed to grid layout
	const [selectedCard, setSelectedCard] = useState<Blog | null>(null);

	// Fetch blogs from backend
	useEffect(() => {
		fetchBlogs();
	}, []);

	const fetchBlogs = async () => {
		try {
			setLoading(true);
			setError(null);
			// Include unapproved blogs for testing (set to false in production)
			const response = await apiClient.get(`${API_ENDPOINTS.BLOGS}?includeUnapproved=true`);
			setBlogs(response.data.data.blogs);
		} catch (err: any) {
			console.error('Failed to fetch blogs:', err);
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

	const toggleLike = (blogId: number) => {
		setLikedBlogs(prev => {
			const newSet = new Set(prev);
			if (newSet.has(blogId)) {
				newSet.delete(blogId);
			} else {
				newSet.add(blogId);
			}
			return newSet;
		});
		// TODO: Backend integration for likes
		console.log('Like toggled for blog:', blogId);
	};

	const handleComment = (blogId: number) => {
		const comment = comments[blogId];
		if (comment?.trim()) {
			console.log('Comment submitted:', { blogId, comment });
			// TODO: Backend integration for comments
			alert('Comment posted! (Mock - will integrate with backend later)');
			setComments(prev => ({ ...prev, [blogId]: '' }));
			setCommentBoxOpen(null);
		}
	};

	const handleShare = (blogId: number) => {
		console.log('Share clicked for blog:', blogId);
		// TODO: Backend integration for shares/reposts
		alert('Share feature coming soon!');
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
										<span className="font-semibold">Back to Trends</span>
									</motion.button>

									{/* Full Card Detail */}
									<motion.div
										initial={{ opacity: 0, y: 30 }}
										animate={{ opacity: 1, y: 0 }}
										className="bg-gradient-to-br from-brand-secondary/10 to-brand-accent/10 rounded-2xl border border-brand-secondary/20 backdrop-blur-sm p-8"
									>
										{/* Header */}
										<div className="flex items-start justify-between mb-6">
											<div className="flex-1">
												<h2 className="text-3xl font-bold text-gradient mb-3">{selectedCard.title}</h2>
												<p className="text-brand-secondary text-base leading-relaxed mb-4">{selectedCard.description}</p>

												{/* AI Insight */}
												<div className="bg-brand-bg/50 rounded-xl p-4 border border-brand-accent/30">
													<div className="flex items-start gap-2">
														<div className="text-lg flex-shrink-0">🤖</div>
														<div className="flex-1 min-w-0">
															<p className="text-xs text-brand-accent font-semibold mb-1">AI INSIGHT</p>
															<p className="text-sm text-white leading-relaxed">{selectedCard.ai_insight}</p>
														</div>
													</div>
												</div>
											</div>
											<div className="flex items-center gap-4 ml-4">
												<div className="text-center">
													<div className="text-lg font-bold text-brand-accent uppercase">{selectedCard.platform}</div>
													<div className="text-xs text-brand-secondary">Platform</div>
												</div>
											</div>
										</div>

										{/* Image */}
										{selectedCard.image && (
											<div className="mb-4 rounded-lg overflow-hidden">
												<img
													src={selectedCard.image}
													alt={selectedCard.title}
													className="w-full h-auto object-cover"
													onError={(e) => { e.currentTarget.style.display = 'none'; }}
												/>
											</div>
										)}

										{/* Timestamp */}
										<div className="flex items-center gap-2 text-brand-secondary text-sm mb-6">
											<span>📅</span>
											<span>{formatDate(selectedCard.createdAt)}</span>
										</div>

										{/* View Original Link */}
										<a
											href={selectedCard.link}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-block px-6 py-3 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/80 transition-all mb-6 font-semibold"
										>
											View Original Article →
										</a>

										{/* Action Buttons */}
										<div className="flex items-center gap-3 pt-6 border-t border-brand-secondary/20">
											<motion.button
												onClick={() => toggleLike(selectedCard.id)}
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10 transition-all group"
											>
												{likedBlogs.has(selectedCard.id) ? (
													<HeartSolidIcon className="w-5 h-5 text-red-500" />
												) : (
													<HeartIcon className="w-5 h-5 text-brand-secondary group-hover:text-red-500 transition-colors" />
												)}
												<span className="text-xs text-brand-secondary group-hover:text-white transition-colors">Like</span>
											</motion.button>

											<motion.button
												onClick={() => setCommentBoxOpen(commentBoxOpen === selectedCard.id ? null : selectedCard.id)}
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10 transition-all group"
											>
												<ChatBubbleLeftIcon className="w-5 h-5 text-brand-secondary group-hover:text-brand-accent transition-colors" />
												<span className="text-xs text-brand-secondary group-hover:text-white transition-colors">Comment</span>
											</motion.button>

											<motion.button
												onClick={() => handleShare(selectedCard.id)}
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10 transition-all group"
											>
												<ShareIcon className="w-5 h-5 text-brand-secondary group-hover:text-brand-accent transition-colors" />
												<span className="text-xs text-brand-secondary group-hover:text-white transition-colors">Repost</span>
											</motion.button>
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
															className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/80 text-white rounded-lg font-semibold text-sm transition-all"
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
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Main Content */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Action Buttons - Right Aligned */}
				<div className="flex items-center justify-end gap-3 mb-6">
					{/* Scraping Button */}
					<motion.button
						onClick={handleScraping}
						disabled={scraping}
						whileHover={{ scale: scraping ? 1 : 1.05 }}
						whileTap={{ scale: scraping ? 1 : 0.95 }}
						className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${scraping
							? 'bg-brand-secondary/30 text-brand-secondary/70 cursor-not-allowed'
							: 'bg-gradient-to-r from-brand-accent to-pink-500 text-white hover:from-brand-accent/80 hover:to-pink-400'
							}`}
					>
						<BoltIcon className={`w-5 h-5 ${scraping ? 'animate-pulse' : ''}`} />
						{scraping ? 'Scraping...' : 'Start Scraping'}
					</motion.button>

					{/* Refresh Button */}
					<motion.button
						onClick={fetchBlogs}
						disabled={loading || scraping}
						whileHover={{ scale: loading || scraping ? 1 : 1.05 }}
						whileTap={{ scale: loading || scraping ? 1 : 0.95 }}
						className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${loading || scraping
							? 'bg-brand-secondary/30 text-brand-secondary/70 cursor-not-allowed'
							: 'bg-brand-secondary/20 text-white hover:bg-brand-secondary/30 border border-brand-secondary/30'
							}`}
					>
						<ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
						Refresh
					</motion.button>
				</div>

				{/* Scraping Status Message */}
				{scrapingMessage && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mb-6 p-4 bg-brand-accent/10 border border-brand-accent/30 rounded-xl text-brand-accent text-sm"
					>
						{scrapingMessage}
					</motion.div>
				)}

				{blogs.length === 0 ? (
					<div className="text-center py-20">
						<p className="text-brand-secondary text-lg mb-2">No fashion trends available yet.</p>
						<p className="text-brand-secondary/60 text-sm">Click "Start Scraping" to fetch the latest trends!</p>
					</div>
				) : (
					<div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
						{blogs.map((blog, index) => {
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
										onClick={() => setSelectedCard(blog)}
										className="bg-gradient-to-br from-brand-secondary/10 to-brand-accent/10 rounded-2xl border border-brand-secondary/20 p-5 cursor-pointer hover:border-brand-accent/40"
									>
										<h2 className="text-xl text-gradient font-bold mb-3">{blog.title}</h2>
										<p className="text-brand-secondary text-sm mb-3 line-clamp-2">{blog.description}</p>
										<span className="text-xs text-brand-accent uppercase">{blog.platform}</span>
										{blog.image && (
											<img src={blog.image} alt={blog.title} className="w-full h-48 object-cover rounded-lg mt-3" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
										)}
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
											<span className="px-3 py-1 bg-brand-accent/20 text-brand-accent rounded-full text-xs font-semibold uppercase ml-3">{blog.platform}</span>
										</div>
										<p className="text-brand-secondary text-sm mb-4">{blog.description}</p>
										<div className="bg-brand-bg/50 rounded-xl p-4 border border-brand-accent/30 mb-4">
											<p className="text-xs text-brand-accent font-semibold mb-1">🤖 AI INSIGHT</p>
											<p className={`text-sm text-white ${!isExpanded ? 'line-clamp-2' : ''}`}>{blog.ai_insight}</p>
										</div>
										<span className="text-xs text-brand-secondary">{formatDate(blog.createdAt)}</span>
									</div>

									<div className="px-6 pb-4">
										<button
											onClick={() => toggleExpand(blog.id)}
											className="w-full py-3 bg-brand-accent/20 text-brand-accent rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
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
												<a href={blog.link} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-6 py-3 bg-brand-accent text-white rounded-lg mb-4 font-semibold">
													View Original Article →
												</a>
												<div className="flex items-center justify-center gap-2 pt-4 border-t border-brand-secondary/20">
													<button onClick={() => toggleLike(blog.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10">
														{likedBlogs.has(blog.id) ? <HeartSolidIcon className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5 text-brand-secondary" />}
														<span className="text-xs text-brand-secondary">Like</span>
													</button>
													<button onClick={() => setCommentBoxOpen(commentBoxOpen === blog.id ? null : blog.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10">
														<ChatBubbleLeftIcon className="w-5 h-5 text-brand-secondary" />
														<span className="text-xs text-brand-secondary">Comment</span>
													</button>
													<button onClick={() => handleShare(blog.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10">
														<ShareIcon className="w-5 h-5 text-brand-secondary" />
														<span className="text-xs text-brand-secondary">Repost</span>
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
				)}
			</section>
		</div>
	);
};

export default AIBlogPage;
