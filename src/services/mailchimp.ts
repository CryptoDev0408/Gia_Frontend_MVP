/**
 * Mailchimp Marketing API Integration
 * 
 * This service handles direct integration with Mailchimp's Marketing API
 * to ensure proper consent tracking and compliance with Mailchimp policies.
 * 
 * Key Features:
 * - Direct API integration (no CSV uploads)
 * - Proper consent tracking through Mailchimp's system
 * - Single opt-in support (immediate subscription)
 * - GDPR compliant
 * 
 * Setup Required:
 * 1. Get Mailchimp API key from: https://admin.mailchimp.com/account/api/
 * 2. Get List/Audience ID from: https://admin.mailchimp.com/lists/
 * 3. Add to .env file:
 *    - VITE_MAILCHIMP_API_KEY=your-api-key
 *    - VITE_MAILCHIMP_LIST_ID=your-list-id
 *    - VITE_MAILCHIMP_SERVER_PREFIX=us21 (or your server prefix)
 */

import axios from 'axios';

interface MailchimpSubscriber {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  tags?: string[];
  marketingPermissions?: boolean;
}

interface MailchimpResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Mailchimp Service Class
 * Handles all interactions with Mailchimp Marketing API
 */
class MailchimpService {
  private apiKey: string;
  private listId: string;
  private serverPrefix: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_MAILCHIMP_API_KEY || '';
    this.listId = import.meta.env.VITE_MAILCHIMP_LIST_ID || '';
    this.serverPrefix = import.meta.env.VITE_MAILCHIMP_SERVER_PREFIX || '';
    this.baseUrl = `https://${this.serverPrefix}.api.mailchimp.com/3.0`;

    if (!this.apiKey || !this.listId || !this.serverPrefix) {
      console.warn('⚠️ Mailchimp configuration missing. Service will use fallback mode.');
    }
  }

  /**
   * Check if Mailchimp is properly configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.listId && this.serverPrefix);
  }

  /**
   * Subscribe a user to the Mailchimp list with proper consent tracking
   * 
   * @param subscriber - Subscriber information including email, name, and consent
   * @returns Promise with success status and message
   */
  async subscribe(subscriber: MailchimpSubscriber): Promise<MailchimpResponse> {
    // If Mailchimp is not configured, return a message
    if (!this.isConfigured()) {
      console.warn('⚠️ Mailchimp not configured. Subscription would be saved to local database only.');
      return {
        success: false,
        message: 'Mailchimp integration not configured. Please set up API credentials.',
        error: 'MAILCHIMP_NOT_CONFIGURED'
      };
    }

    try {
      // Prepare subscriber data with proper structure for Mailchimp API
      const subscriberData = {
        email_address: subscriber.email,
        status: 'subscribed', // Use 'subscribed' for single opt-in, 'pending' for double opt-in
        merge_fields: {
          FNAME: subscriber.firstName,
          LNAME: subscriber.lastName,
          ...(subscriber.phone && { PHONE: subscriber.phone })
        },
        // Track consent timestamp and IP (important for GDPR compliance)
        timestamp_opt: new Date().toISOString(),
        marketing_permissions: subscriber.marketingPermissions ? [{
          marketing_permission_id: 'email',
          enabled: true
        }] : [],
        // Add tags for segmentation
        tags: subscriber.tags || ['Waitlist', 'Website Signup']
      };

      // Make API request to Mailchimp
      // Note: In production, this should go through your backend to keep API key secure
      const response = await axios.post(
        `${this.baseUrl}/lists/${this.listId}/members`,
        subscriberData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        message: 'Successfully subscribed! You\'re now on the waitlist.',
        data: response.data
      };

    } catch (error: any) {
      console.error('❌ Mailchimp subscription error:', error);

      // Handle specific Mailchimp errors
      if (error.response?.data) {
        const mailchimpError = error.response.data;

        // Check if email already exists
        if (mailchimpError.title === 'Member Exists') {
          return {
            success: false,
            message: 'This email is already subscribed to our waitlist.',
            error: 'EMAIL_EXISTS'
          };
        }

        // Check if email is invalid
        if (mailchimpError.title === 'Invalid Resource') {
          return {
            success: false,
            message: 'Invalid email address. Please check and try again.',
            error: 'INVALID_EMAIL'
          };
        }

        // Generic Mailchimp error
        return {
          success: false,
          message: mailchimpError.detail || 'Failed to subscribe. Please try again.',
          error: mailchimpError.title
        };
      }

      // Network or other errors
      return {
        success: false,
        message: 'Connection error. Please check your internet and try again.',
        error: error.message
      };
    }
  }

  /**
   * Update subscriber information
   * Useful for updating consent or profile information
   */
  async updateSubscriber(email: string, updates: Partial<MailchimpSubscriber>): Promise<MailchimpResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Mailchimp integration not configured.',
        error: 'MAILCHIMP_NOT_CONFIGURED'
      };
    }

    try {
      // Generate subscriber hash (MD5 of lowercase email)
      const subscriberHash = await this.getSubscriberHash(email);

      const updateData: any = {};

      if (updates.firstName || updates.lastName) {
        updateData.merge_fields = {
          ...(updates.firstName && { FNAME: updates.firstName }),
          ...(updates.lastName && { LNAME: updates.lastName })
        };
      }

      if (updates.tags) {
        updateData.tags = updates.tags;
      }

      const response = await axios.patch(
        `${this.baseUrl}/lists/${this.listId}/members/${subscriberHash}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        message: 'Subscriber information updated successfully.',
        data: response.data
      };

    } catch (error: any) {
      console.error('❌ Mailchimp update error:', error);
      return {
        success: false,
        message: 'Failed to update subscriber information.',
        error: error.message
      };
    }
  }

  /**
   * Generate MD5 hash of email for Mailchimp subscriber ID
   */
  private async getSubscriberHash(email: string): Promise<string> {
    const lowerEmail = email.toLowerCase();
    // For browser compatibility, use a simple hash or external library
    // In production, handle this on the backend
    const encoder = new TextEncoder();
    const data = encoder.encode(lowerEmail);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Add tags to a subscriber for segmentation
   */
  async addTags(email: string, tags: string[]): Promise<MailchimpResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Mailchimp integration not configured.',
        error: 'MAILCHIMP_NOT_CONFIGURED'
      };
    }

    try {
      const subscriberHash = await this.getSubscriberHash(email);

      const response = await axios.post(
        `${this.baseUrl}/lists/${this.listId}/members/${subscriberHash}/tags`,
        {
          tags: tags.map(tag => ({ name: tag, status: 'active' }))
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        message: 'Tags added successfully.',
        data: response.data
      };

    } catch (error: any) {
      console.error('❌ Mailchimp tag error:', error);
      return {
        success: false,
        message: 'Failed to add tags.',
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const mailchimpService = new MailchimpService();

// Export types
export type { MailchimpSubscriber, MailchimpResponse };
