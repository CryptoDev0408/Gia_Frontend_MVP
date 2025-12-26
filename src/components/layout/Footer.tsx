import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    // ✅ Check localStorage first
    const cached = localStorage.getItem("footerData");
    if (cached) {
      setData(JSON.parse(cached));
    }

    // ✅ Always fetch fresh footer data
    const fetchFooter = async () => {
      try {
        const res = await axios.get("https://admin.giafashion.io/api/footer");
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
              src="/logo.jpg"
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
                {list.items?.map((item, i) => (
                  <li key={i}>
                    <a
                      href={item.link}
                      className="text-brand-secondary hover:text-brand-accent transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Social Icons */}
        <SocialLinks className="mt-12" />

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
