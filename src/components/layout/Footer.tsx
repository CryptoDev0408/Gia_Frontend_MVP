import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SocialLinks } from '../ui/SocialLinks';

interface FooterItem {
  name: string;
  link: string;
}

interface FooterList {
  title: string;
  items: FooterItem[];
}

interface SocialIcon {
  icon: string;
  link: string;
}

interface FooterData {
  image: string;
  title: string;
  description: string;
  lists: FooterList[];
  social_icons: SocialIcon[];
  copyright_text: string;
}

export const Footer: React.FC = () => {
  const [data, setData] = useState<FooterData | null>(null);
  const navigate = useNavigate();

  const handleFooterLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    e.preventDefault();

    // Handle hero section links (/, #, or empty)
    if (link === '/' || link === '#' || link === '') {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      return;
    }

    // Handle section anchors (#about, #team, etc.) - Update URL and scroll
    if (link.startsWith('#')) {
      const sectionId = link.substring(1);

      // Special case: #whitepaper should navigate to /pitch-deck
      if (sectionId === 'whitepaper') {
        navigate('/pitch-deck');
        setTimeout(() => {
          const element = document.getElementById('whitepaper');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
        return;
      }

      // Navigate to section route (updates URL to /about, /team, etc.)
      navigate(`/${sectionId}`);

      // Scroll to section after navigation
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return;
    }

    // Regular route navigation
    navigate(link);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // ✅ Check localStorage first
    const cached = localStorage.getItem("footerData");
    if (cached) {
      setData(JSON.parse(cached));
    }

    // ✅ Always fetch fresh footer data
    const fetchFooter = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_LARAVEL_BACKEND_URL}/api/footer`);
        setData(res.data);
        localStorage.setItem("footerData", JSON.stringify(res.data));
      } catch (err) {
        console.error("Error fetching footer data:", err);
      }
    };

    fetchFooter();
  }, []);

  if (!data) {
    return <p className="text-center text-white py-8">Loading footer...</p>;
  }

  return (
    <footer className="bg-brand-dark/50 border-t border-brand-secondary/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo & Description */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <img
              src="/logo.png"
              alt="GIA Token"
              className="h-20 w-20 object-contain opacity-90"
            />
          </div>
          <h4 className="text-white text-xl font-small mb-2">{data.title}</h4>
          <p className="text-brand-secondary max-w-2xl mx-auto leading-relaxed">
            {data.description}
          </p>
        </motion.div>

        {/* Footer Lists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {data.lists?.map((list, idx) => (
            <motion.div
              key={idx}
              className="text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <h5 className="text-lg font-small text-white mb-4">{list.title}</h5>
              <ul className="space-y-2">
                {list.items?.map((item, i) => {
                  // Check if item name is "Contact us", if true, return custom content
                  if (item.name === "Contact us") {
                    return (
                      <li key={i}>
                        {item.name}
                        <br />
                        <span style={{ color: "rgb(95, 144, 204)" }}>{'contact@giafashion.io'}</span> {/* Green color */}
                      </li>
                    );
                  }

                  // Render the list item for all other names
                  return (
                    <li key={i}>
                      <a
                        href="#"
                        onClick={(e) => handleFooterLinkClick(e, item.link)}
                        className="text-brand-secondary hover:text-brand-accent transition-colors cursor-pointer"
                      >
                        {item.name}
                      </a>
                    </li>
                  );
                })}
              </ul>


              {list.title.toLowerCase() === "contact us" && (
                <p className="text-brand-secondary mt-4">
                  <a href="mailto:contact@giafashion.io" className="hover:text-brand-accent transition-colors">
                    contact@giafashion.io
                  </a>
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Social Icons */}
        <SocialLinks className="mt-12" socialIcons={data.social_icons} />



        {/* Copyright */}
        <motion.div
          className="text-center mt-8 text-brand-secondary text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <p>{data.copyright_text}</p>
        </motion.div>
      </div>
    </footer>
  );
};
