import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Button } from '../ui/Button';

interface MenuItem {
  text: string;
  link: string;
}

interface ButtonData {
  text: string;
  link: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  // isConnected: boolean;
  // account: string | null;
  // onConnectWallet: () => void;
  // isConnecting: boolean;
  menuItems: MenuItem[];       // dynamic menu items
  button?: ButtonData | null;  // dynamic button
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  // isConnected,
  // account,
  // onConnectWallet,
  // isConnecting,
  menuItems,
  // button,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // const formatAddress = (address: string) => {
  //   return `${address.slice(0, 6)}...${address.slice(-4)}`;
  // };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    e.preventDefault();
    onClose();
    if (link.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(link);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const element = document.querySelector(link);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate(link);
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto' },
  };

  return (
    <motion.div
      className="md:hidden bg-brand-bg border-t border-brand-secondary/20 overflow-hidden"
      initial="hidden"
      animate={isOpen ? 'visible' : 'hidden'}
      variants={menuVariants}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 py-6 space-y-6 flex flex-col items-center">
        {menuItems.map((item) => (
          <a
            key={item.text}
            href={item.link}
            className="block text-white hover:text-brand-accent transition-colors text-center cursor-pointer"
            onClick={(e) => handleNavClick(e, item.link)}
          >
            {item.text}
          </a>
        ))}

        {/* AI Blog Link */}
        <Link
          to="/ai-blog"
          className="block text-white hover:text-brand-accent transition-colors text-center font-semibold"
          onClick={onClose}
        >
          AI Blog
        </Link>

        {/* {button && (
          <Button
            onClick={() => {
              onConnectWallet();
              onClose();
            }}
            disabled={isConnecting}
            variant="outline"
            className="w-full max-w-xs"
          >
            {isConnecting
              ? 'Connecting...'
              : isConnected && account
                ? formatAddress(account)
                : button.text}
          </Button>
        )} */}
      </div>
    </motion.div>
  );
};
