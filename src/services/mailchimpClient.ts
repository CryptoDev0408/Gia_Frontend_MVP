/**
 * Mailchimp Integration Service (Frontend)
 * 
 * This service communicates with our Laravel backend which handles
 * the actual Mailchimp API integration securely.
 * 
 * Benefits of backend proxy:
 * - API keys remain secure on server
 * - Better error handling and validation
 * - Can log and track subscriptions in our database
 * - Mailchimp consent properly tracked through their system
 */

import axios from 'axios';

interface SubscriberData {
	email: string;
	firstName: string;
	lastName: string;
	phone?: string;
	source?: string;
	consentGiven: boolean;
}

interface SubscriptionResponse {
	success: boolean;
	message: string;
	mailchimpStatus?: 'subscribed' | 'pending' | 'unsubscribed';
	savedToDatabase?: boolean;
}

/**
 * Subscribe user to waitlist with Mailchimp integration
 * 
 * This will:
 * 1. Save to our database (for backup/records)
 * 2. Send to Mailchimp API (for email campaigns)
 * 3. Properly track consent through Mailchimp system
 */
export async function subscribeToWaitlist(data: SubscriberData): Promise<SubscriptionResponse> {
	try {
		const response = await axios.post(
			`${import.meta.env.VITE_LARAVEL_BACKEND_URL}/api/newsletter/subscribe`,
			{
				email: data.email,
				first_name: data.firstName,
				last_name: data.lastName,
				phone: data.phone,
				source: data.source || 'website_waitlist',
				consent_given: data.consentGiven,
				consent_timestamp: new Date().toISOString(),
				ip_address: '', // Backend will capture this
			},
			{
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				}
			}
		);

		return response.data;
	} catch (error: any) {
		console.error('Subscription error:', error);

		if (error.response?.data) {
			return error.response.data;
		}

		return {
			success: false,
			message: 'Connection error. Please check your internet and try again.',
			savedToDatabase: false
		};
	}
}

/**
 * Check if an email is already subscribed
 */
export async function checkSubscriptionStatus(email: string): Promise<{ subscribed: boolean; status?: string }> {
	try {
		const response = await axios.get(
			`${import.meta.env.VITE_LARAVEL_BACKEND_URL}/api/newsletter/check/${email}`
		);
		return response.data;
	} catch (error) {
		console.error('Check subscription error:', error);
		return { subscribed: false };
	}
}

export type { SubscriberData, SubscriptionResponse };
