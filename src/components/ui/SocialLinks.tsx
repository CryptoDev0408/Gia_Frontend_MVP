import React from 'react';
import { motion } from 'framer-motion';
import { SocialIcon } from 'react-social-icons';
import { SOCIAL_LINKS } from '../../utils/constants';
import { trackSocialClick } from '../../utils/analytics';

interface SocialIconData {
  icon: string;
  link: string;
}

interface SocialLinksProps {
  className?: string;
  socialIcons?: SocialIconData[];
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ className = '', socialIcons }) => {
  // Map icon names to network identifiers for react-social-icons
  const iconToNetwork: Record<string, string> = {
    telegram: 'telegram',
    discord: 'discord',
    twitter: 'x',
    x: 'x',
    instagram: 'instagram',
    linkedin: 'linkedin',
    youtube: 'youtube',
  };

  // If socialIcons are provided from API, use them; otherwise fall back to constants
  const socials = socialIcons && socialIcons.length > 0
    ? socialIcons
      .filter(social => social.link) // Only include items with valid links
      .map(social => ({
        url: social.link,
        network: iconToNetwork[social.icon.toLowerCase()] || social.icon.toLowerCase(),
      }))
    : [
      { url: SOCIAL_LINKS.telegram, network: 'telegram' },
      { url: SOCIAL_LINKS.discord, network: 'discord' },
      { url: SOCIAL_LINKS.twitter, network: 'x' },
      { url: SOCIAL_LINKS.instagram, network: 'instagram' },
      { url: SOCIAL_LINKS.linkedin, network: 'linkedin' },
      { url: SOCIAL_LINKS.youtube, network: 'youtube' },
    ];

  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      {socials.map((social, index) => (
        <motion.a
          key={social.url}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            // Map network to specific event name
            const eventMap: Record<string, any> = {
              'telegram': 'event_social_telegram',
              'discord': 'event_social_discord',
              'x': 'event_social_x',
              'twitter': 'event_social_x',
              'instagram': 'event_social_instagram',
              'youtube': 'event_social_youtube',
              'linkedin': 'event_social_linkedin'
            };

            const eventName = eventMap[social.network.toLowerCase()] || 'event_social_x';

            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', eventName, {
                event_category: 'social_engagement',
                event_label: social.network,
                social_url: social.url,
                section: 'footer',
                timestamp: new Date().toISOString()
              });
            }
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <SocialIcon
            url={social.url}
            network={social.network}
            bgColor="#FFFFFFCC"
            fgColor="#0e151d"
            style={{ height: 48, width: 48 }}
          />
        </motion.a>
      ))}
    </div>
  );
};