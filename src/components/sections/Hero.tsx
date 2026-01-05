import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useTypingAnimation } from '../../hooks/useTypingAnimation';
import { FaDiscord, FaTelegram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

interface ButtonType {
  label: string;
  link: string;
}

interface SocialType {
  name: string;
  icon: string;
  link: string;
}

interface HeroData {
  title: string;
  subtitle: string;
  poster: string;
  video: string;
  buttons: ButtonType[];
  socials: SocialType[];
}

export const Hero: React.FC = () => {
  const [heroData, setHeroData] = useState<HeroData | null>(() => {
    const cached = localStorage.getItem("heroData");
    return cached ? JSON.parse(cached) : null;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_LARAVEL_BACKEND_URL}/api/hero`)
      .then((res) => {
        setHeroData(res.data);
        localStorage.setItem("heroData", JSON.stringify(res.data));
      })
      .catch((err) => {
        console.error('Failed to fetch hero data:', err);
      });
  }, []);

  const { displayText } = useTypingAnimation(heroData?.subtitle || '', 30);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_LARAVEL_BACKEND_URL}/api/newsletter`, {
        email: email,
      });

      alert(response.data.message);
      setEmail("");
    } catch (error: any) {
      if (error.response) {
        alert(error.response.data.message || "Something went wrong");
      } else if (error.request) {
        console.error("No response from server:", error.request);
        alert("No response from server");
      } else {
        console.error("Axios error:", error.message);
        alert("Request error: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!heroData) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <section className="min-h-screen flex items-end justify-start relative overflow-hidden bg-brand-bg">
      {/* Background Video with Fallback */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/gia-heros-main-3200x2160.jpg"
        className="absolute inset-0 w-full h-full object-cover object-top"
      >
        <source src="/PixVerse_V5_Image_Text_720P_slowly_transitions-home.mp4" type="video/mp4" />
      </video>

      {/* Video Overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 via-brand-bg/60 to-transparent" /> */}

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-8 w-full">
        <div className="flex flex-col items-center h-full h-full mx-auto">
          {/* Single Column - Text Content */}
          <motion.div
            className="text-center max-w-6xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Animated Title */}
            <motion.h1 className="text-2xl md:text-3xl lg:text-3xl text-white mb-6">
              {heroData.title.split(' ').map((word, i) => (
                <span key={i} className="text-gradient">{word} </span>
              ))}
            </motion.h1>

            {/* Animated Subtitle with Typing Effect */}
            <motion.div className="max-w-3xl mb-8 mx-auto">
              <p className="text-md md:text-md font-small text-white leading-relaxed">
                {displayText}
                <motion.span className="inline-block w-1 h-6 bg-brand-accent ml-1" animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div className="flex flex-col sm:flex-row gap-4 mb-4 justify-center">

              {/* Trigger Button */}
              <Button
                size="lg"
                variant="translucent"
                className="min-w-[200px]  font-thin wawitlist"
                onClick={() => setIsOpen(true)}
              >
                Join Our Waitlist
              </Button>

              {/* Popup */}
              {isOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                  <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-lg w-full max-w-lg relative">

                    {/* Close Button */}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
                    >
                      ✕
                    </button>

                    {/* Newsletter Form */}
                    <form onSubmit={handleSubmit} className="my-8">
                      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="flex-1 px-4 py-3 bg-brand-cardbg/70 border border-brand-secondary/20 rounded-lg 
                             text-white placeholder-brand-secondary focus:border-brand-accent 
                             focus:outline-none transition-colors duration-200"
                          required
                        />
                        <Button
                          type="submit"
                          size="lg"
                          variant="translucent"
                          disabled={isLoading}
                          className="min-w-[150px] subscribe-me"
                        >
                          {isLoading ? "Joining..." : "Join Waitlist"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Custom Style */}
              <style>
                {`
          .subscribe-me {
            font-weight: 200;
          }
            .wawitlist{
           font-size: 16px;
           }
        `}
              </style>



              {heroData.buttons.map((btn, index) => (
                <Button
                  key={index}
                  size="lg"
                  variant="translucent"
                  onClick={() => {
                    if (btn?.link) {
                      // If it's a storage path, prepend the Laravel backend URL
                      const url = btn.link.startsWith('/storage/')
                        ? `${import.meta.env.VITE_LARAVEL_BACKEND_URL}${btn.link}`
                        : btn.link;
                      window.open(url, '_blank');
                    }
                  }}
                  className={`min-w-[200px] font-thin ${index === 0 ? 'Join-wrapper' : 'down-wrapper'}`}
                >
                  {btn.label}
                </Button>
              ))}

              <>
                <style>
                  {`
        .down-wrapper {
          background: #faf9f615;
          color: #faf9f6;
          border-color: #faf9f640;
          border-width: 1px;
          backdrop-filter: blur(6px);
          font-size: 16px;
        }
         .Join-wrapper{
          font-size: 16px;
          display: none;
         } 
      `}
                </style>
              </>
            </motion.div>


            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <div className="flex items-center justify-center space-x-4">
                {heroData.socials.map((social, index) => {
                  // Skip if social link or name is empty
                  if (!social || !social.link || !social.name) return null;

                  const getIcon = (name: string) => {
                    const lowerName = name.toLowerCase();
                    if (lowerName.includes('telegram')) return <FaTelegram size={30} />;
                    if (lowerName.includes('discord')) return <FaDiscord size={30} />;
                    if (lowerName.includes('x') || lowerName.includes('twitter')) return <FaXTwitter size={30} />;
                    if (lowerName.includes('youtube')) return <FaYoutube size={30} />;
                    return <FaXTwitter size={30} />;
                  };

                  return (
                    <div
                      key={index}
                      style={{
                        cursor: "pointer",
                        color: "#faf9f615",
                        backdropFilter: "blur(4px)",
                        width: "70px",
                        height: "70px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #faf9f640",
                        borderRadius: "50%",
                      }}
                    >
                      <a
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-brand-accent transition-colors"
                      >
                        {getIcon(social.name)}
                      </a>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
