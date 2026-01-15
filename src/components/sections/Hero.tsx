import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useTypingAnimation } from '../../hooks/useTypingAnimation';
import { FaDiscord, FaTelegram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import { trackEvent } from '../../utils/analytics';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [heroData, setHeroData] = useState<HeroData | null>(() => {
    const cached = localStorage.getItem("heroData");
    return cached ? JSON.parse(cached) : null;
  });
  // const [videoReady, setVideoReady] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [allowContact, setAllowContact] = useState(false);

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

  // Optimized video loading - show immediately for fast CDN delivery
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Set video ready immediately for CDN-hosted videos
      // setVideoReady(true);

      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log('Autoplay prevented, will play on interaction:', error);
          const playOnInteraction = () => {
            video.play();
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction, { once: true });
          document.addEventListener('touchstart', playOnInteraction, { once: true });
        });
      }
    }
  }, []);

  const { displayText } = useTypingAnimation(heroData?.subtitle || '', 30);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${import.meta.env.VITE_LARAVEL_BACKEND_URL}/api/newsletter`, formData);

      if (response.data.success) {
        alert(response.data.message);
        setFormData({ email: '', first_name: '', last_name: '', phone: '' });
        setIsOpen(false);
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || "Something went wrong");
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
      {/* Background Video - CDN hosted for instant loading */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-top"
        poster="/gia-heros-main-3200x2160.jpg"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        <source src="https://gia-vercel-frontend-video-upload.vercel.app/hero.mp4" type="video/mp4" />
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
                onClick={() => {
                  trackEvent('event_join_waitlist', {
                    event_category: 'engagement',
                    event_label: 'join_waitlist_hero',
                    section: 'hero'
                  });
                  setIsOpen(true);
                }}
              >
                Join Our Waitlist
              </Button>

              {/* Popup */}
              {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                  <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 rounded-2xl shadow-2xl w-full max-w-sm relative border border-brand-accent/20">

                    {/* Close Button */}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="hover:cursor-pointer absolute top-3 right-3 text-gray-400 hover:text-white text-xl transition-colors"
                    >
                      ✕
                    </button>

                    {/* Header */}
                    <div className="text-center mb-4">
                      <h2 className="text-2xl text-white mb-4">Join Our Waitlist</h2>
                      {/* <p className="text-brand-secondary text-xs">Be the first to know when we launch</p> */}
                    </div>

                    {/* Newsletter Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {/* First Name */}
                        <div>
                          <label className="block text-white text-xs font-medium mb-1">First Name</label>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            placeholder="John"
                            className="w-full px-3 py-2 bg-white/5 border border-brand-secondary/30 rounded-lg text-sm
                             text-white placeholder-brand-secondary/50 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20
                             focus:outline-none transition-all duration-200"
                            required
                          />
                          {errors.first_name && <p className="text-red-400 text-xs mt-1">{errors.first_name[0]}</p>}
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="block text-white text-xs font-medium mb-1">Last Name</label>
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            placeholder="Doe"
                            className="w-full px-3 py-2 bg-white/5 border border-brand-secondary/30 rounded-lg text-sm
                             text-white placeholder-brand-secondary/50 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20
                             focus:outline-none transition-all duration-200"
                            required
                          />
                          {errors.last_name && <p className="text-red-400 text-xs mt-1">{errors.last_name[0]}</p>}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-white text-xs font-medium mb-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john.doe@example.com"
                          className="w-full px-3 py-2 bg-white/5 border border-brand-secondary/30 rounded-lg text-sm
                           text-white placeholder-brand-secondary/50 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20
                           focus:outline-none transition-all duration-200"
                          required
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email[0]}</p>}
                      </div>

                      {/* Phone */}
                      {/* <div>
                        <label className="block text-white text-xs font-medium mb-1">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-3 py-2 bg-white/5 border border-brand-secondary/30 rounded-lg text-sm
                           text-white placeholder-brand-secondary/50 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20
                           focus:outline-none transition-all duration-200"
                          required
                        />
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone[0]}</p>}
                      </div> */}

                      {/* Allow Contact Checkbox */}
                      <div className="flex items-center mt-8">
                        <input
                          type="checkbox"
                          id="allowContact"
                          checked={allowContact}
                          onChange={(e) => setAllowContact(e.target.checked)}
                          className="w-4 h-4 text-brand-accent bg-white/5 border-brand-secondary/30 rounded focus:ring-brand-accent focus:ring-2"
                        />
                        <label htmlFor="allowContact" className="ml-2 text-white text-sm">
                          Consent to admin contact
                        </label>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isLoading || !allowContact}
                        className="w-full mt-4 bg-[#1f6153] hover:bg-[#0b3539] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Joining..." : "Join Waitlist"}
                      </Button>

                      {/* Privacy Notice */}
                      {/* <p className="text-center text-brand-secondary text-xs mt-3">
                        We respect your privacy. Your information will never be shared.
                      </p> */}
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
                    // Track document download events based on button label
                    const label = btn.label?.toLowerCase() || '';
                    if (label.includes('whitepaper')) {
                      trackEvent('event_document_whitepaper', {
                        event_category: 'document_download',
                        event_label: 'whitepaper_button',
                        document_url: btn.link,
                        section: 'hero'
                      });
                    } else if (label.includes('teaser') || label.includes('one page')) {
                      trackEvent('event_document_onepageteaser', {
                        event_category: 'document_download',
                        event_label: 'onepage_teaser_button',
                        document_url: btn.link,
                        section: 'hero'
                      });
                    }

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

                  const handleSocialClick = (socialName: string, link: string) => {
                    const lowerName = socialName.toLowerCase();
                    let eventName: any = 'event_social_x';

                    if (lowerName.includes('telegram')) {
                      eventName = 'event_social_telegram';
                    } else if (lowerName.includes('discord')) {
                      eventName = 'event_social_discord';
                    } else if (lowerName.includes('x') || lowerName.includes('twitter')) {
                      eventName = 'event_social_x';
                    } else if (lowerName.includes('instagram')) {
                      eventName = 'event_social_instagram';
                    } else if (lowerName.includes('youtube')) {
                      eventName = 'event_social_youtube';
                    } else if (lowerName.includes('linkedin')) {
                      eventName = 'event_social_linkedin';
                    }

                    trackEvent(eventName, {
                      event_category: 'social_engagement',
                      event_label: socialName.toLowerCase(),
                      social_url: link,
                      section: 'hero'
                    });
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
                        onClick={() => handleSocialClick(social.name, social.link)}
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
