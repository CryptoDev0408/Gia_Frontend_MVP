import React from 'react';
import { motion } from 'framer-motion';
import { SocialIcon } from 'react-social-icons';
import { SOCIAL_LINKS } from '../../utils/constants';

interface SocialLinksProps {
  className?: string;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ className = '' }) => {
  const socials = [
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