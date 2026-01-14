import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Button } from '../ui/Button';
// import { useWallet } from '../../hooks/useWallet';
import { useAuth } from '../../contexts/AuthContext';
import { MobileMenu } from './MobileMenu';
import axios from 'axios';
import { trackEvent } from '../../utils/analytics';

interface MenuItem {
  text: string;
  link: string;
}

interface ButtonData {
  text: string;
  link: string;
}

interface HeaderData {
  logo: string;
  menu_items: string; // stored as JSON string in API
  button: string;     // stored as JSON string in API
}

// Default header data for instant display (no loading state)
const DEFAULT_HEADER_DATA: HeaderData = {
  logo: "/uploads/logo.png",
  menu_items: JSON.stringify([
    { text: "Home", link: "#" },
    { text: "About", link: "#about" },
    { text: "Pitch Deck", link: "#whitepaper" },
    { text: "FAQ", link: "#faq" },
    { text: "Join", link: "#join" },
    { text: "Team", link: "#team" }
  ]),
  button: JSON.stringify({ text: "Connect Wallet", link: "/get-started" })
};

export const Header: React.FC = () => {
  // Initialize with cache or default data (no null state)
  const [headerData, setHeaderData] = useState<HeaderData>(() => {
    const cachedData = localStorage.getItem("headerData");
    return cachedData ? JSON.parse(cachedData) : DEFAULT_HEADER_DATA;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  // const { account, isConnected, isConnecting, connect, disconnect } = useWallet();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch fresh data in background and update if changed
    const fetchHeader = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_LARAVEL_BACKEND_URL}/api/header`);
        setHeaderData(res.data);
        localStorage.setItem("headerData", JSON.stringify(res.data));
      } catch (err) {
        console.error("Error fetching header:", err);
        // Keep using default or cached data on error
      }
    };

    fetchHeader();
  }, []);

  // const handleConnectWallet = async () => {
  //   if (isConnected) await disconnect();
  //   else await connect();
  // };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string, itemText?: string) => {
    e.preventDefault();

    // Track navigation event
    if (itemText) {
      const eventMap: { [key: string]: any } = {
        'Home': 'event_nav_btn_home',
        'About': 'event_nav_btn_about',
        'Pitch Deck': 'event_nav_btn_pitchdeck',
        'FAQ': 'event_nav_btn_faq',
        'Join': 'event_nav_btn_join',
        'Team': 'event_nav_btn_team'
      };

      const eventName = eventMap[itemText];
      if (eventName) {
        trackEvent(eventName, {
          event_category: 'navigation',
          event_label: itemText.toLowerCase().replace(' ', '_'),
          link: link
        });
      }
    }

    // Handle hero section links (/, #, or empty)
    if (link === '/' || link === '#' || link === '') {
      if (location.pathname !== '/') {
        // Navigate to home, then scroll to top
        navigate('/', { replace: true });
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        // Already on home, just scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // Handle section anchors (#about, #team, etc.)
    if (link.startsWith('#')) {
      const sectionId = link.substring(1);

      if (location.pathname !== '/') {
        // Navigate to home first, then scroll to section
        navigate('/', { replace: true });
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        // Already on home, just scroll to section
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      return;
    }

    // Regular route navigation (/privacy, /ai-blog, etc.)
    navigate(link);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  // Parse JSON strings safely or use directly if already parsed
  let menuItems: MenuItem[] = [];
  let buttonData: ButtonData | null = null;
  try {
    menuItems = typeof headerData.menu_items === 'string'
      ? JSON.parse(headerData.menu_items)
      : headerData.menu_items;
  } catch { }

  try {
    buttonData = typeof headerData.button === 'string'
      ? JSON.parse(headerData.button)
      : headerData.button;
  } catch { }

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 border-b border-brand-secondary/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ background: '#0e151d' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex-shrink-0 flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to='/' className="flex items-center">
              <img
                src="/logo.png"
                alt="GIA Token"
                className="h-12 w-12 object-contain opacity-90"
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.text}
                href="#"
                onClick={(e) => handleNavClick(e, item.link, item.text)}
                className="text-white hover:text-brand-accent transition-colors cursor-pointer"
              >
                {item.text}
              </a>
            ))}
            {/* AI Blog Link */}
            {/* <Link
              to="/ai-blog"
              onClick={() => {
                trackEvent('event_nav_btn_aiblog', {
                  event_category: 'navigation',
                  event_label: 'ai_blog'
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-white hover:text-brand-accent transition-colors cursor-pointer"
            >
              AI Blog
            </Link> */}
            {/* Users Link - Admin Only */}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link
                to="/users"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-white hover:text-brand-accent transition-colors cursor-pointer"
              >
                Users
              </Link>
            )}
          </nav>

          {/* Connect Wallet / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Auth User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{
                    backgroundColor: 'rgba(31, 97, 83, 0.5)',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0b3539';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1f6153';
                  }}
                >
                  <UserCircleIcon className="h-8 w-8 text-white" />
                  <span className="text-sm font-semibold text-white">{user.username || user.email}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-[#0e151d] to-[#1a1f2e] border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/10 py-2 backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-purple-500/20">
                      <p className="text-xs text-gray-400 mb-1">Signed in as</p>
                      <p className="text-sm text-white font-semibold truncate">{user.email || user.username}</p>
                    </div>
                    <button
                      onClick={() => {
                        trackEvent('event_sign_out', {
                          event_category: 'authentication',
                          event_label: 'sign_out_button',
                          user_email: user.email
                        });
                        logout();
                        setShowUserMenu(false);
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-purple-500/20 transition-all duration-200 font-medium flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal('login');
                }}
                className="text-white hover:text-brand-accent transition-colors cursor-pointer bg-transparent border-none p-0 font-normal text-base"
              >
                Sign In
              </button>
            )}

            {/* Wallet Connect Button */}
            {/* <Button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              variant="outline"
              className="min-w-[140px] font-small connect-wallet"
            >
              {isConnecting ? 'Connecting...' : isConnected && account ? formatAddress(account) : buttonData?.text || 'Connect Wallet'}
            </Button> */}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-brand-accent focus:outline-none">
              {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        // isConnected={isConnected}
        // account={account}
        // onConnectWallet={handleConnectWallet}
        // isConnecting={isConnecting}
        menuItems={menuItems}
        button={buttonData}
      />
    </motion.header>
  );
};
