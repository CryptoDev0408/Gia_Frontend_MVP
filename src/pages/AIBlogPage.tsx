import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftIcon, BookmarkIcon, ShareIcon, ChevronDownIcon, Bars3Icon, Squares2X2Icon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

// Mock data structure
interface TrendPost {
	id: string;
	platform: 'twitter' | 'instagram';
	text: string;
	hashtags: string[];
	engagement: {
		likes: number;
		comments: number;
		shares: number;
	};
	timestamp: string;
	author: string;
	imageUrl?: string;
	viralityScore: number;
	relevanceScore: number;
}

interface TrendCluster {
	id: string;
	title: string;
	aiInsight: string;
	trendScore: number;
	growthPercentage: number;
	post: TrendPost; // Changed from posts array to single post
	clusteredHashtags: string[];
}

// Mock Data
const mockTrendClusters: TrendCluster[] = [
	{
		id: 'cluster-1',
		title: 'Neon Streetwear Revival',
		aiInsight: 'Neon streetwear is experiencing a 37% surge this week across platforms. Bold fluorescent colors combined with oversized silhouettes are dominating urban fashion feeds, particularly among Gen-Z influencers.',
		trendScore: 94,
		growthPercentage: 37,
		clusteredHashtags: ['#neonstreetware', '#neonvibes', '#streetstyle', '#boldcolors', '#urbanglow'],
		post: {
			id: 'post-1',
			platform: 'instagram',
			text: 'Neon green oversized hoodie paired with black cargo pants. The glow-up is real! 🔥 This streetwear combo is everywhere right now.',
			hashtags: ['#neonstreetware', '#streetstyle', '#urbanglow', '#fashionweek'],
			engagement: { likes: 12500, comments: 342, shares: 890 },
			timestamp: '2 hours ago',
			author: '@streetstyle_maven',
			imageUrl: '/gia-heros-portrait-853x1280.jpg',
			viralityScore: 92,
			relevanceScore: 88
		}
	},
	{
		id: 'cluster-2',
		title: 'Sustainable Luxury Materials',
		aiInsight: 'High-end sustainable materials are trending up 28% week-over-week. Mushroom leather, recycled ocean plastics, and bio-fabricated textiles are becoming mainstream in luxury fashion discourse.',
		trendScore: 89,
		growthPercentage: 28,
		clusteredHashtags: ['#sustainablefashion', '#ecofriendly', '#mushroomleather', '#luxurygreen', '#circularfashion'],
		post: {
			id: 'post-2',
			platform: 'instagram',
			text: 'Mycelium leather handbags are the future. Sustainable, luxurious, and guilt-free. This eco-conscious wardrobe essential is taking over high fashion! 🌱✨',
			hashtags: ['#mushroomleather', '#sustainablefashion', '#ecobags', '#luxurygreen'],
			engagement: { likes: 6700, comments: 189, shares: 2100 },
			timestamp: '6 hours ago',
			author: '@eco_fashion_board',
			imageUrl: '/gia-heros-presentation-1280x864.jpg',
			viralityScore: 85,
			relevanceScore: 92
		}
	},
	{
		id: 'cluster-3',
		title: 'Y2K Comeback - Metallics & Mini',
		aiInsight: 'Y2K aesthetics are back with a vengeance, up 42% this month. Metallic mini skirts, butterfly clips, and low-rise everything are flooding social feeds, blending nostalgia with modern edge.',
		trendScore: 91,
		growthPercentage: 42,
		clusteredHashtags: ['#y2kfashion', '#2000saesthetic', '#metallicskirt', '#nostalgiafashion', '#minimoment'],
		post: {
			id: 'post-3',
			platform: 'twitter',
			text: 'The Y2K metallic mini moment is REAL. Just walked past 5 people wearing silver mini skirts in 10 minutes. The early 2000s are officially back and I\'m here for it 🦋✨',
			hashtags: ['#y2kfashion', '#metallicskirt', '#2000saesthetic', '#fashiontwitter'],
			engagement: { likes: 23400, comments: 567, shares: 1890 },
			timestamp: '3 hours ago',
			author: '@y2k_fashion_observer',
			imageUrl: '/gia-heros-1280x853.jpg',
			viralityScore: 93,
			relevanceScore: 87
		}
	},
	{
		id: 'cluster-4',
		title: 'Oversized Blazer Power Dressing',
		aiInsight: 'The oversized blazer trend is surging 45% this week, redefining power dressing for 2025. Neutral tones combined with structured shoulders are creating a new corporate-casual hybrid aesthetic.',
		trendScore: 88,
		growthPercentage: 45,
		clusteredHashtags: ['#blazerfashion', '#powerdressing', '#oversizedstyle', '#corporatechic', '#workweartrend'],
		post: {
			id: 'post-4',
			platform: 'instagram',
			text: 'Oversized beige blazer + white tee + straight leg jeans = the ultimate 2025 power move. This is how we do business casual now 💼',
			hashtags: ['#blazerfashion', '#powerdressing', '#workweartrend', '#ootd'],
			engagement: { likes: 18900, comments: 423, shares: 1560 },
			timestamp: '5 hours ago',
			author: '@modern_workwear',
			imageUrl: '/gia-heros-presentation2-1280x864.jpg',
			viralityScore: 89,
			relevanceScore: 91
		}
	},
	{
		id: 'cluster-5',
		title: 'Dopamine Dressing - Bold Color Blocking',
		aiInsight: 'Dopamine dressing reaches new heights with 52% growth in bold color-blocking posts. Vibrant contrasting colors are being used to combat seasonal blues and express joy through fashion.',
		trendScore: 96,
		growthPercentage: 52,
		clusteredHashtags: ['#dopaminedressing', '#colorblocking', '#boldcolors', '#happyfashion', '#vibestyle'],
		post: {
			id: 'post-5',
			platform: 'twitter',
			text: 'Color blocking is not just a trend, it\'s a mood. Orange blazer + purple skirt + yellow bag = instant serotonin boost. Fashion as therapy is REAL 🌈🎨',
			hashtags: ['#dopaminedressing', '#colorblocking', '#fashiontherapy', '#boldcolors'],
			engagement: { likes: 31200, comments: 892, shares: 2890 },
			timestamp: '1 hour ago',
			author: '@color_therapy_style',
			viralityScore: 97,
			relevanceScore: 94
		}
	}
];

const platformColors = {
	twitter: 'bg-black',
	instagram: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500'
};

const platformIcons = {
	twitter: '𝕏',
	instagram: '📷'
};

export const AIBlogPage: React.FC = () => {
	const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
	const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
	const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
	const [commentBoxOpen, setCommentBoxOpen] = useState<string | null>(null);
	const [comments, setComments] = useState<Record<string, string>>({});
	const [viewMode, setViewMode] = useState<'row' | 'grid'>('row');
	const [selectedCard, setSelectedCard] = useState<TrendCluster | null>(null);

	const toggleExpand = (clusterId: string) => {
		setExpandedCards(prev => {
			const newSet = new Set(prev);
			if (newSet.has(clusterId)) {
				newSet.delete(clusterId);
			} else {
				newSet.add(clusterId);
			}
			return newSet;
		});
	};

	const toggleLike = (postId: string) => {
		setLikedPosts(prev => {
			const newSet = new Set(prev);
			if (newSet.has(postId)) {
				newSet.delete(postId);
			} else {
				newSet.add(postId);
			}
			return newSet;
		});
	};

	const toggleSave = (postId: string) => {
		setSavedPosts(prev => {
			const newSet = new Set(prev);
			if (newSet.has(postId)) {
				newSet.delete(postId);
			} else {
				newSet.add(postId);
			}
			return newSet;
		});
	};

	const handleComment = (postId: string) => {
		const comment = comments[postId];
		if (comment?.trim()) {
			console.log('Comment submitted:', { postId, comment });
			alert('Comment posted! (Mock - stored in browser console)');
			setComments(prev => ({ ...prev, [postId]: '' }));
			setCommentBoxOpen(null);
		}
	};

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
												<p className="text-brand-secondary text-base leading-relaxed">{selectedCard.aiInsight}</p>
											</div>
											<div className="flex items-center gap-4 ml-4">
												<div className="text-center">
													<div className="text-2xl font-bold text-brand-accent">{selectedCard.trendScore}</div>
													<div className="text-xs text-brand-secondary">Score</div>
												</div>
												<div className="text-center">
													<div className="text-2xl font-bold text-green-500">+{selectedCard.growthPercentage}%</div>
													<div className="text-xs text-brand-secondary">Growth</div>
												</div>
											</div>
										</div>

										{/* Hashtags */}
										<div className="flex flex-wrap gap-2 mb-6">
											{selectedCard.clusteredHashtags.map((tag) => (
												<span
													key={tag}
													className="px-3 py-1 bg-brand-accent/20 text-brand-accent text-xs rounded-full border border-brand-accent/30"
												>
													{tag}
												</span>
											))}
										</div>

										{/* Post Detail */}
										<div className="border-t border-brand-secondary/20 pt-6">
											{/* Platform Badge */}
											<div className="flex items-center gap-3 mb-4">
												<div className={`${platformColors[selectedCard.post.platform]} text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2`}>
													<span className="text-lg">{platformIcons[selectedCard.post.platform]}</span>
													{selectedCard.post.platform === 'twitter' ? 'X (Twitter)' : 'Instagram'}
												</div>
												<span className="text-brand-secondary text-sm">{selectedCard.post.timestamp}</span>
											</div>

											{/* Author & Scores */}
											<div className="flex items-center justify-between mb-4">
												<span className="text-brand-accent font-semibold">{selectedCard.post.author}</span>
												<div className="flex gap-4 text-sm">
													<span className="text-brand-secondary">Virality: <span className="text-brand-accent font-semibold">{selectedCard.post.viralityScore}</span></span>
													<span className="text-brand-secondary">Relevance: <span className="text-brand-accent font-semibold">{selectedCard.post.relevanceScore}</span></span>
												</div>
											</div>

											{/* Image if exists */}
											{selectedCard.post.imageUrl && (
												<div className="mb-4 rounded-lg overflow-hidden">
													<img
														src={selectedCard.post.imageUrl}
														alt={selectedCard.title}
														className="w-full h-auto object-cover"
													/>
												</div>
											)}

											{/* Post Text */}
											<p className="text-white text-base leading-relaxed mb-4">{selectedCard.post.text}</p>

											{/* Post Hashtags */}
											<div className="flex flex-wrap gap-2 mb-6">
												{selectedCard.post.hashtags.map((tag) => (
													<span key={tag} className="text-brand-accent text-sm hover:text-white cursor-pointer transition-colors">
														{tag}
													</span>
												))}
											</div>

											{/* Engagement Stats */}
											<div className="flex items-center gap-6 text-sm text-brand-secondary border-t border-brand-secondary/20 pt-4">
												<span className="flex items-center gap-1">
													<HeartIcon className="w-4 h-4" />
													{selectedCard.post.engagement.likes.toLocaleString()} likes
												</span>
												<span className="flex items-center gap-1">
													<ChatBubbleLeftIcon className="w-4 h-4" />
													{selectedCard.post.engagement.comments.toLocaleString()} comments
												</span>
												<span className="flex items-center gap-1">
													<ShareIcon className="w-4 h-4" />
													{selectedCard.post.engagement.shares.toLocaleString()} shares
												</span>
											</div>

											{/* Action Buttons */}
											<div className="flex items-center gap-3 mt-6 pt-6 border-t border-brand-secondary/20">
												<motion.button
													onClick={() => toggleLike(selectedCard.post.id)}
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.9 }}
													className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10 transition-all group"
												>
													{likedPosts.has(selectedCard.post.id) ? (
														<HeartSolidIcon className="w-5 h-5 text-red-500" />
													) : (
														<HeartIcon className="w-5 h-5 text-brand-secondary group-hover:text-red-500 transition-colors" />
													)}
													<span className="text-xs text-brand-secondary group-hover:text-white transition-colors">Like</span>
												</motion.button>

												<motion.button
													onClick={() => toggleSave(selectedCard.post.id)}
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.9 }}
													className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10 transition-all group"
												>
													{savedPosts.has(selectedCard.post.id) ? (
														<BookmarkSolidIcon className="w-5 h-5 text-brand-accent" />
													) : (
														<BookmarkIcon className="w-5 h-5 text-brand-secondary group-hover:text-brand-accent transition-colors" />
													)}
													<span className="text-xs text-brand-secondary group-hover:text-white transition-colors">Save</span>
												</motion.button>

												<motion.button
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.9 }}
													className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10 transition-all group"
												>
													<ShareIcon className="w-5 h-5 text-brand-secondary group-hover:text-brand-accent transition-colors" />
													<span className="text-xs text-brand-secondary group-hover:text-white transition-colors">Share</span>
												</motion.button>
											</div>
										</div>
									</motion.div>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Main Content */}
			{/* Header Section */}
			{/* <section className="relative overflow-hidden bg-gradient-to-b from-brand-bg to-brand-bg/50 py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center"
					>
						<h1 className="text-4xl md:text-5xl text-gradient mb-6 font-bold">
							AI Fashion Trend Intelligence
						</h1>
						<p className="text-lg md:text-xl text-brand-secondary max-w-3xl mx-auto leading-relaxed">
							Real-time trend analysis powered by AI. Discover what's shaping the fashion world across X and Instagram.
						</p>
					</motion.div>
				</div>
			</section> */}

			{/* Trend Cards Grid */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* View Mode Toggle */}
				<div className="flex justify-end mb-6">
					<div className="flex items-center gap-1 bg-gradient-to-r from-brand-secondary/5 to-brand-accent/5 rounded-xl p-1.5 border border-brand-secondary/30 shadow-lg shadow-brand-accent/5">
						<motion.button
							onClick={() => setViewMode('row')}
							whileHover={{ scale: 1.08, y: -2 }}
							whileTap={{ scale: 0.92 }}
							animate={{
								backgroundColor: viewMode === 'row' ? '#c5a267' : 'transparent',
								boxShadow: viewMode === 'row' ? '0 4px 20px rgba(197, 162, 103, 0.4)' : 'none',
							}}
							transition={{ duration: 0.3, ease: "easeInOut" }}
							className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all relative overflow-hidden ${viewMode === 'row'
								? 'text-white shadow-xl'
								: 'text-brand-secondary hover:text-white hover:bg-brand-secondary/10'
								}`}
						>
							{viewMode === 'row' && (
								<motion.div
									layoutId="activeTab"
									className="absolute inset-0 bg-brand-accent rounded-lg"
									initial={false}
									transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
								/>
							)}
							<Bars3Icon className={`w-5 h-5 relative z-10 transition-transform ${viewMode === 'row' ? 'scale-110' : ''}`} />
							<span className={`text-sm font-semibold relative z-10 ${viewMode === 'row' ? 'tracking-wide' : ''}`}>Row</span>
						</motion.button>
						<motion.button
							onClick={() => setViewMode('grid')}
							whileHover={{ scale: 1.08, y: -2 }}
							whileTap={{ scale: 0.92 }}
							animate={{
								backgroundColor: viewMode === 'grid' ? '#c5a267' : 'transparent',
								boxShadow: viewMode === 'grid' ? '0 4px 20px rgba(197, 162, 103, 0.4)' : 'none',
							}}
							transition={{ duration: 0.3, ease: "easeInOut" }}
							className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all relative overflow-hidden ${viewMode === 'grid'
								? 'text-white shadow-xl'
								: 'text-brand-secondary hover:text-white hover:bg-brand-secondary/10'
								}`}
						>
							{viewMode === 'grid' && (
								<motion.div
									layoutId="activeTab"
									className="absolute inset-0 bg-brand-accent rounded-lg"
									initial={false}
									transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
								/>
							)}
							<Squares2X2Icon className={`w-5 h-5 relative z-10 transition-transform ${viewMode === 'grid' ? 'scale-110' : ''}`} />
							<span className={`text-sm font-semibold relative z-10 ${viewMode === 'grid' ? 'tracking-wide' : ''}`}>Grid</span>
						</motion.button>
					</div>
				</div>

				<div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
					{mockTrendClusters.map((cluster, index) => {
						const isExpanded = expandedCards.has(cluster.id);
						const post = cluster.post;

						// Grid Mode - Compact Card with Hover and Click
						if (viewMode === 'grid') {
							return (
								<motion.div
									key={cluster.id}
									initial={{ opacity: 0, y: 50 }}
									whileInView={{ opacity: 1, y: 0 }}
									whileHover={{ scale: 1.02, y: -5 }}
									transition={{ duration: 0.3 }}
									viewport={{ once: true }}
									onClick={() => setSelectedCard(cluster)}
									className="bg-gradient-to-br from-brand-secondary/10 to-brand-accent/10 rounded-2xl border border-brand-secondary/20 backdrop-blur-sm overflow-hidden hover:border-brand-accent/40 transition-all duration-300 hover:shadow-xl hover:shadow-brand-accent/20 cursor-pointer"
								>
									<div className="p-5">
										{/* Header */}
										<div className="flex items-start justify-between mb-3">
											<h2 className="text-lg md:text-xl text-gradient font-bold flex-1">{cluster.title}</h2>
											<div className="flex gap-2 ml-3">
												<div className="text-center">
													<div className="text-lg font-bold text-brand-accent">{cluster.trendScore}</div>
													<div className="text-[10px] text-brand-secondary">Score</div>
												</div>
												<div className="text-center">
													<div className="text-lg font-bold text-green-500">+{cluster.growthPercentage}%</div>
													<div className="text-[10px] text-brand-secondary">Growth</div>
												</div>
											</div>
										</div>

										{/* AI Insight */}
										<p className="text-brand-secondary text-sm leading-relaxed mb-3 line-clamp-2">{cluster.aiInsight}</p>

										{/* Platform Badge */}
										<div className="flex items-center gap-2 mb-3">
											<div className={`${platformColors[post.platform]} text-white px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1`}>
												<span>{platformIcons[post.platform]}</span>
												{post.platform === 'twitter' ? 'X' : 'IG'}
											</div>
											<span className="text-brand-secondary text-xs">{post.timestamp}</span>
										</div>

										{/* Image if exists */}
										{post.imageUrl && (
											<div className="mb-3 rounded-lg overflow-hidden">
												<img
													src={post.imageUrl}
													alt={cluster.title}
													className="w-full h-48 object-cover"
												/>
											</div>
										)}

										{/* Post Text */}
										<p className="text-white text-sm leading-relaxed mb-3 line-clamp-3">{post.text}</p>

										{/* Engagement Stats */}
										<div className="flex items-center gap-4 text-xs text-brand-secondary">
											<span className="flex items-center gap-1">
												<HeartIcon className="w-3 h-3" />
												{post.engagement.likes.toLocaleString()}
											</span>
											<span className="flex items-center gap-1">
												<ChatBubbleLeftIcon className="w-3 h-3" />
												{post.engagement.comments.toLocaleString()}
											</span>
											<span className="flex items-center gap-1">
												<ShareIcon className="w-3 h-3" />
												{post.engagement.shares.toLocaleString()}
											</span>
										</div>

										{/* Click to view indicator */}
										<div className="mt-3 pt-3 border-t border-brand-secondary/20 text-center">
											<span className="text-brand-accent text-xs font-semibold">Click to view details →</span>
										</div>
									</div>
								</motion.div>
							);
						}

						// Row Mode - Full Card with Expand
						return (
							<motion.div
								key={cluster.id}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								viewport={{ once: true }}
								className="bg-gradient-to-br from-brand-secondary/10 to-brand-accent/10 rounded-2xl border border-brand-secondary/20 backdrop-blur-sm overflow-hidden hover:border-brand-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-brand-accent/10"
								style={{ cursor: isExpanded ? 'default' : 'pointer' }}
							>
								{/* Card Header - Always Visible */}
								<div className="p-6">
									<div className="flex items-start justify-between mb-4">
										<h2 className="text-xl md:text-2xl text-gradient font-bold flex-1">
											{cluster.title}
										</h2>
										<div className="flex items-center gap-2 flex-shrink-0 ml-3">
											<span className="px-2 py-1 bg-brand-accent/20 text-brand-accent rounded-full text-xs font-semibold">
												{cluster.trendScore}
											</span>
											<span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
												↑{cluster.growthPercentage}%
											</span>
										</div>
									</div>

									{/* AI Insight Preview */}
									<div className="bg-brand-bg/50 rounded-xl p-4 border border-brand-accent/30 mb-4">
										<div className="flex items-start gap-2">
											<div className="text-lg flex-shrink-0">🤖</div>
											<div className="flex-1 min-w-0">
												<p className="text-xs text-brand-accent font-semibold mb-1">AI INSIGHT</p>
												<p className={`text-sm text-white leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
													{cluster.aiInsight}
												</p>
											</div>
										</div>
									</div>

									{/* Hashtags Preview */}
									<div className="flex flex-wrap gap-2 mb-4">
										{cluster.clusteredHashtags.slice(0, 3).map((tag, idx) => (
											<motion.span
												key={idx}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												className="px-3 py-1 bg-brand-secondary/20 text-brand-secondary rounded-full text-xs hover:bg-brand-accent/20 hover:text-brand-accent transition-all cursor-pointer"
											>
												{tag}
											</motion.span>
										))}
										{cluster.clusteredHashtags.length > 3 && !isExpanded && (
											<span className="px-3 py-1 bg-brand-secondary/10 text-brand-secondary rounded-full text-xs">
												+{cluster.clusteredHashtags.length - 3}
											</span>
										)}
									</div>
								</div>

								{/* Expand Button */}
								<div className="px-6 pb-4">
									<motion.button
										onClick={() => toggleExpand(cluster.id)}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className="w-full py-3 px-4 bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-brand-accent/30"
									>
										{isExpanded ? 'Show Less' : 'View Details'}
										<motion.div
											animate={{ rotate: isExpanded ? 180 : 0 }}
											transition={{ duration: 0.3 }}
										>
											<ChevronDownIcon className="w-5 h-5" />
										</motion.div>
									</motion.button>
								</div>

								{/* Expanded Content */}
								<AnimatePresence>
									{isExpanded && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: 'auto', opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.3 }}
											className="overflow-hidden"
										>
											<div className="px-6 pb-6 pt-2 border-t border-brand-secondary/20">
												{/* All Hashtags */}
												{cluster.clusteredHashtags.length > 3 && (
													<div className="flex flex-wrap gap-2 mb-6">
														{cluster.clusteredHashtags.slice(3).map((tag, idx) => (
															<motion.span
																key={idx}
																whileHover={{ scale: 1.05 }}
																whileTap={{ scale: 0.95 }}
																className="px-3 py-1 bg-brand-secondary/20 text-brand-secondary rounded-full text-xs hover:bg-brand-accent/20 hover:text-brand-accent transition-all cursor-pointer"
															>
																{tag}
															</motion.span>
														))}
													</div>
												)}

												{/* Source Post */}
												<div className="bg-brand-bg/60 rounded-xl p-5 border border-brand-secondary/20">
													<h4 className="text-sm font-semibold text-white mb-4">Source Content</h4>

													{/* Post Header */}
													<div className="flex items-center justify-between mb-4">
														<div className="flex items-center gap-3">
															<motion.div
																whileHover={{ scale: 1.1, rotate: 5 }}
																className={`${platformColors[post.platform]} w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg`}
															>
																{platformIcons[post.platform]}
															</motion.div>
															<div>
																<p className="text-white font-semibold text-sm">{post.author}</p>
																<p className="text-brand-secondary text-xs capitalize">{post.platform} • {post.timestamp}</p>
															</div>
														</div>
														<div className="flex items-center gap-2">
															<span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold">
																V:{post.viralityScore}
															</span>
															<span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
																R:{post.relevanceScore}
															</span>
														</div>
													</div>

													{/* Post Content */}
													<p className="text-white text-sm mb-4 leading-relaxed">{post.text}</p>

													{/* Post Image */}
													{post.imageUrl && (
														<motion.div
															whileHover={{ scale: 1.02 }}
															className="mb-4 rounded-lg overflow-hidden"
														>
															<img src={post.imageUrl} alt="Post content" className="w-full h-48 object-cover" />
														</motion.div>
													)}

													{/* Post Hashtags */}
													<div className="flex flex-wrap gap-2 mb-4">
														{post.hashtags.map((tag, idx) => (
															<motion.span
																key={idx}
																whileHover={{ scale: 1.05 }}
																className="text-brand-accent text-xs hover:underline cursor-pointer"
															>
																{tag}
															</motion.span>
														))}
													</div>

													{/* Engagement Stats */}
													<div className="flex items-center justify-between pt-4 border-t border-brand-secondary/20">
														<div className="flex items-center gap-4 text-brand-secondary text-xs">
															<span>{post.engagement.likes.toLocaleString()} likes</span>
															<span>{post.engagement.comments.toLocaleString()} comments</span>
															<span>{post.engagement.shares.toLocaleString()} shares</span>
														</div>
													</div>

													{/* Interaction Buttons */}
													<div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-brand-secondary/20">
														<motion.button
															onClick={() => toggleLike(post.id)}
															whileHover={{ scale: 1.1 }}
															whileTap={{ scale: 0.9 }}
															className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10 transition-all group"
														>
															{likedPosts.has(post.id) ? (
																<HeartSolidIcon className="w-5 h-5 text-red-500" />
															) : (
																<HeartIcon className="w-5 h-5 text-brand-secondary group-hover:text-red-500 transition-colors" />
															)}
															<span className="text-xs text-brand-secondary group-hover:text-white transition-colors">Like</span>
														</motion.button>

														<motion.button
															onClick={() => setCommentBoxOpen(commentBoxOpen === post.id ? null : post.id)}
															whileHover={{ scale: 1.1 }}
															whileTap={{ scale: 0.9 }}
															className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10 transition-all group"
														>
															<ChatBubbleLeftIcon className="w-5 h-5 text-brand-secondary group-hover:text-brand-accent transition-colors" />
															<span className="text-xs text-brand-secondary group-hover:text-white transition-colors">Comment</span>
														</motion.button>

														<motion.button
															onClick={() => toggleSave(post.id)}
															whileHover={{ scale: 1.1 }}
															whileTap={{ scale: 0.9 }}
															className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10 transition-all group"
														>
															{savedPosts.has(post.id) ? (
																<BookmarkSolidIcon className="w-5 h-5 text-brand-accent" />
															) : (
																<BookmarkIcon className="w-5 h-5 text-brand-secondary group-hover:text-brand-accent transition-colors" />
															)}
															<span className="text-xs text-brand-secondary group-hover:text-white transition-colors">Save</span>
														</motion.button>

														<motion.button
															whileHover={{ scale: 1.1 }}
															whileTap={{ scale: 0.9 }}
															className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-accent/10 transition-all group"
														>
															<ShareIcon className="w-5 h-5 text-brand-secondary group-hover:text-brand-accent transition-colors" />
															<span className="text-xs text-brand-secondary group-hover:text-white transition-colors">Share</span>
														</motion.button>
													</div>

													{/* Comment Box */}
													<AnimatePresence>
														{commentBoxOpen === post.id && (
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
																		value={comments[post.id] || ''}
																		onChange={(e) => setComments(prev => ({ ...prev, [post.id]: e.target.value }))}
																		placeholder="Add a comment..."
																		className="flex-1 px-3 py-2 bg-brand-cardbg/70 border border-brand-secondary/20 rounded-lg text-white text-sm placeholder-brand-secondary focus:border-brand-accent focus:outline-none transition-all"
																		onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
																	/>
																	<motion.button
																		onClick={() => handleComment(post.id)}
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
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						);
					})}
				</div>
			</section>

			{/* Footer Info */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
				<p className="text-brand-secondary text-sm">
					Trend data updated in real-time from X and Instagram • AI-powered insights generated every 6 hours
				</p>
			</section>
		</div>
	);
};

export default AIBlogPage;
