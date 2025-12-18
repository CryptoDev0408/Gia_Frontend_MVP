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
  ];

  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      {socials.map((social, index) => (
        <motion.div
          key={social.url}
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
            target="_blank"
            rel="noopener noreferrer"
          />
        </motion.div>
      ))}
    </div>
  );
};