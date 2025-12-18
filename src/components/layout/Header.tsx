import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { useWallet } from '../../hooks/useWallet';
import { MobileMenu } from './MobileMenu';
import axios from 'axios';

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

export const Header: React.FC = () => {
  const [headerData, setHeaderData] = useState<HeaderData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { account, isConnected, isConnecting, connect, disconnect } = useWallet();

  useEffect(() => {
    // Try localStorage first
    const cachedData = localStorage.getItem("headerData");
    if (cachedData) {
      setHeaderData(JSON.parse(cachedData));
    }

    // Always fetch fresh data (background update)
    const fetchHeader = async () => {
      try {
        const res = await axios.get("https://admin.giafashion.io/api/header");
        setHeaderData(res.data);
        localStorage.setItem("headerData", JSON.stringify(res.data));
      } catch (err) {
        console.error("Error fetching header:", err);
      }
    };

    fetchHeader();
  }, []);

  const handleConnectWallet = async () => {
    if (isConnected) await disconnect();
    else await connect();
  };

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (!headerData) return <p className="text-white text-center py-4">Loading header...</p>;

  // Parse JSON strings safely
  let menuItems: MenuItem[] = [];
  let buttonData: ButtonData | null = null;
  try {
    menuItems = JSON.parse(headerData.menu_items);
  } catch {}
  try {
    buttonData = JSON.parse(headerData.button);
  } catch {}

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
           <a href='/' className="flex items-center">
             <img
              src="/logo.png"
              alt="GIA Token"
              className="h-12 w-12 object-contain opacity-90"
            />
           </a>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
            {menuItems.map((item) => (
              <a key={item.text} href={item.link} className="text-white hover:text-brand-accent transition-colors">
                {item.text}
              </a>
            ))}
          </nav>

          {/* Connect Wallet / Button */}
          <div className="hidden md:block">
            <Button onClick={handleConnectWallet} disabled={isConnecting} variant="outline" className="min-w-[140px] font-small connect-wallet">
              {isConnecting ? 'Connecting...' : isConnected && account ? formatAddress(account) : buttonData?.text || 'Connect Wallet'}
            </Button>
             <>
    <style>
      {`
        .connect-wallet {
         font-weight: 400;
          border-width: 1px;
        }
      `}
    </style>
  </>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-brand-accent focus:outline-none connect-wallet">
              {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isConnected={isConnected}
        account={account}
        onConnectWallet={handleConnectWallet}
        isConnecting={isConnecting}
        menuItems={menuItems}
        button={buttonData}
      />
    </motion.header>
  );
};
