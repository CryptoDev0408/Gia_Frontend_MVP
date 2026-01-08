/**
 * Google Analytics 4 (GA4) Tracking Utility
 * 
 * This module provides a type-safe wrapper around GA4's gtag function
 * to track user interactions and custom events throughout the application.
 */

// Extend Window interface to include gtag
declare global {
	interface Window {
		gtag: (
			command: 'config' | 'event' | 'set',
			targetId: string,
			config?: Record<string, any>
		) => void;
		dataLayer: any[];
	}
}

export type EventName =
	| 'page_view'
	| 'email_signup'
	| 'newsletter_subscribe'
	| 'wallet_connect_attempt'
	| 'wallet_connected'
	| 'wallet_disconnect'
	| 'social_click'
	| 'document_download'
	| 'whitepaper_download'
	| 'video_play'
	| 'video_complete'
	| 'cta_click'
	| 'form_submit'
	| 'form_error'
	| 'external_link_click'
	| 'blog_view'
	| 'blog_like'
	| 'event_sign_in'
	| 'event_sign_up'
	| 'event_sign_out'
	| 'event_nav_btn_aiblog'
	| 'event_join_waitlist'
	| 'event_document_whitepaper'
	| 'event_document_onepageteaser';

export interface EventParams {
	event_category?: string;
	event_label?: string;
	value?: number;
	wallet_address?: string;
	social_platform?: string;
	document_name?: string;
	error_message?: string;
	email?: string;
	form_name?: string;
	link_url?: string;
	page_path?: string;
	page_title?: string;
	blog_id?: string | number;
	blog_title?: string;
	[key: string]: any;
}

/**
 * Track a custom event in GA4
 * @param eventName - The name of the event to track
 * @param params - Additional parameters for the event
 */
export const trackEvent = (eventName: EventName, params?: EventParams): void => {
	if (typeof window !== 'undefined' && window.gtag) {
		try {
			window.gtag('event', eventName, {
				...params,
				timestamp: new Date().toISOString(),
			});

			// Log in development
			if (import.meta.env.DEV) {
				console.log('📊 GA4 Event:', eventName, params);
			}
		} catch (error) {
			console.error('Failed to track GA4 event:', error);
		}
	} else if (import.meta.env.DEV) {
		console.warn('GA4 not initialized. Event:', eventName, params);
	}
};

/**
 * Track page views
 * @param path - The page path
 * @param title - The page title
 */
export const trackPageView = (path: string, title?: string): void => {
	trackEvent('page_view', {
		page_path: path,
		page_title: title || document.title,
	});
};

/**
 * Track email/newsletter signups
 * @param email - User email (hashed or anonymized recommended)
 * @param source - Where the signup occurred (e.g., 'hero', 'footer', 'join_revolution')
 */
export const trackEmailSignup = (source: string, success: boolean = true): void => {
	trackEvent(success ? 'email_signup' : 'form_error', {
		event_category: 'engagement',
		event_label: source,
		form_name: 'email_signup',
	});
};

/**
 * Track newsletter subscriptions
 * @param source - Where the subscription occurred
 */
export const trackNewsletterSubscribe = (source: string): void => {
	trackEvent('newsletter_subscribe', {
		event_category: 'engagement',
		event_label: source,
	});
};

/**
 * Track wallet connection attempts and successes
 * @param walletType - Type of wallet (e.g., 'metamask', 'walletconnect')
 * @param success - Whether the connection was successful
 * @param walletAddress - User's wallet address (optional, anonymize if needed)
 */
export const trackWalletConnect = (
	walletType: string,
	success: boolean,
	walletAddress?: string
): void => {
	trackEvent(success ? 'wallet_connected' : 'wallet_connect_attempt', {
		event_category: 'web3',
		event_label: walletType,
		wallet_address: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : undefined,
	});
};

/**
 * Track wallet disconnection
 */
export const trackWalletDisconnect = (): void => {
	trackEvent('wallet_disconnect', {
		event_category: 'web3',
	});
};

/**
 * Track social media link clicks
 * @param platform - Social media platform name
 * @param url - The destination URL
 */
export const trackSocialClick = (platform: string, url: string): void => {
	trackEvent('social_click', {
		event_category: 'social',
		event_label: platform,
		social_platform: platform,
		link_url: url,
	});
};

/**
 * Track document/whitepaper downloads
 * @param documentName - Name of the document
 * @param documentUrl - URL of the document
 */
export const trackDocumentDownload = (documentName: string, documentUrl: string): void => {
	trackEvent('document_download', {
		event_category: 'downloads',
		event_label: documentName,
		document_name: documentName,
		link_url: documentUrl,
	});
};

/**
 * Track whitepaper downloads specifically
 * @param version - Whitepaper version or name
 */
export const trackWhitepaperDownload = (version: string): void => {
	trackEvent('whitepaper_download', {
		event_category: 'downloads',
		event_label: version,
		document_name: 'whitepaper',
	});
};

/**
 * Track video interactions
 * @param videoName - Name of the video
 * @param action - Action performed ('play', 'pause', 'complete')
 * @param progress - Video progress percentage (0-100)
 */
export const trackVideoInteraction = (
	videoName: string,
	action: 'play' | 'pause' | 'complete',
	progress?: number
): void => {
	const eventName = action === 'complete' ? 'video_complete' : 'video_play';
	trackEvent(eventName, {
		event_category: 'video',
		event_label: videoName,
		value: progress,
	});
};

/**
 * Track CTA (Call to Action) button clicks
 * @param ctaName - Name or identifier of the CTA
 */
export const trackCTAClick = (ctaName: string): void => {
	trackEvent('cta_click', {
		event_category: 'engagement',
		event_label: ctaName,
		value: 1,
	});
};

/**
 * Track form submissions
 * @param formName - Name of the form
 * @param success - Whether submission was successful
 */
export const trackFormSubmit = (formName: string, success: boolean): void => {
	trackEvent(success ? 'form_submit' : 'form_error', {
		event_category: 'forms',
		event_label: formName,
		form_name: formName,
	});
};

/**
 * Track external link clicks
 * @param url - The external URL
 * @param linkText - The link text or context
 */
export const trackExternalLink = (url: string, linkText?: string): void => {
	trackEvent('external_link_click', {
		event_category: 'navigation',
		event_label: linkText || url,
		link_url: url,
	});
};

/**
 * Track blog post views
 * @param blogId - Blog post ID
 * @param blogTitle - Blog post title
 */
export const trackBlogView = (blogId: string | number, blogTitle: string): void => {
	trackEvent('blog_view', {
		event_category: 'blog',
		event_label: blogTitle,
		blog_id: blogId,
		blog_title: blogTitle,
	});
};

/**
 * Track blog post likes
 * @param blogId - Blog post ID
 * @param blogTitle - Blog post title
 */
export const trackBlogLike = (blogId: string | number, blogTitle: string): void => {
	trackEvent('blog_like', {
		event_category: 'blog',
		event_label: blogTitle,
		blog_id: blogId,
		blog_title: blogTitle,
		value: 1,
	});
};

/**
 * Set user properties for GA4
 * @param properties - User properties to set
 */
export const setUserProperties = (properties: Record<string, any>): void => {
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('set', 'user_properties', properties);
	}
};

/**
 * Initialize GA4 with custom configuration
 * @param measurementId - GA4 Measurement ID
 * @param config - Additional configuration options
 */
export const initGA4 = (measurementId: string, config?: Record<string, any>): void => {
	if (typeof window !== 'undefined' && window.gtag) {
		window.gtag('config', measurementId, {
			send_page_view: false, // We'll manually track page views
			...config,
		});

		if (import.meta.env.DEV) {
			console.log('✅ GA4 Initialized:', measurementId);
		}
	}
};

export default {
	trackEvent,
	trackPageView,
	trackEmailSignup,
	trackNewsletterSubscribe,
	trackWalletConnect,
	trackWalletDisconnect,
	trackSocialClick,
	trackDocumentDownload,
	trackWhitepaperDownload,
	trackVideoInteraction,
	trackCTAClick,
	trackFormSubmit,
	trackExternalLink,
	trackBlogView,
	trackBlogLike,
	setUserProperties,
	initGA4,
};
