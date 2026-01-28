import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import axios from 'axios';
// import { trackWhitepaperDownload } from '../../utils/analytics';

// Icons
import {
  CpuChipIcon,
  ShieldCheckIcon,
  ArrowsRightLeftIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

// Map icons for highlights (so backend only sends a key like "cpu", "shield", etc.)
const highlightIcons: any = {
  cpu: CpuChipIcon,
  shield: ShieldCheckIcon,
  arrows: ArrowsRightLeftIcon,
  bolt: BoltIcon,
  wrench: WrenchScrewdriverIcon,
  code: CodeBracketIcon,
};

export const Whitepaper: React.FC = () => {
  const [whitepaper, setWhitepaper] = useState<any>(null);

  useEffect(() => {
    // ✅ Check localStorage first
    const cached = localStorage.getItem("whitepaperData");
    if (cached) {
      setWhitepaper(JSON.parse(cached));
    }

    // ✅ Always fetch fresh data in background
    const fetchWhitepaper = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_LARAVEL_BACKEND_URL}/api/updateWhitepaper`);
        setWhitepaper(res.data);
        localStorage.setItem("whitepaperData", JSON.stringify(res.data));
      } catch (err) {
        console.error("Error fetching Whitepaper:", err);
      }
    };

    fetchWhitepaper();
  }, []);
  if (!whitepaper) {
    return (
      <section className="py-20 text-center text-white">
        <p>Loading Whitepaper...</p>
      </section>
    );
  }

  return (
    <section id="whitepaper" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Video with Fallback */}
      <video
        key="whitepaper-bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-video-background-1920x1080-cover.jpg"
        className="absolute inset-0 w-full h-full object-cover"
        onLoadedData={(e) => {
          const video = e.currentTarget;
          video.play().catch(err => console.log('Whitepaper background video autoplay prevented:', err));
        }}
      >
        <source src={whitepaper.video || 'https://gia-files.vercel.app/live-wall2.mp4'} type="video/mp4" />
      </video>

      {/* Video Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/90 via-brand-bg/80 to-brand-bg/90" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-3xl text-gradient mb-6 leading-tight">
            {whitepaper.title}
          </h2>
          <p className="text-md md:text-md text-brand-secondary max-w-3xl mx-auto leading-relaxed mb-8">
            {whitepaper.description}
          </p>
          <Button
            size="lg"
            variant="translucent"
            onClick={() => {
              if (whitepaper?.button_link) {
                // Track with new event name
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'event_document_whitepaper', {
                    event_category: 'document_download',
                    event_label: 'whitepaper_section',
                    document_url: whitepaper.button_link,
                    document_name: whitepaper?.button_text || 'Whitepaper',
                    section: 'whitepaper',
                    timestamp: new Date().toISOString()
                  });
                }
                window.open(whitepaper.button_link, "_blank");
              }
            }}
            className="min-w-[250px] download-deck"
          >
            {whitepaper?.button_text || "Download"}

            <>
              <style>
                {`
        .download-deck {
          font-weight: 200;
      }
      `}
              </style>
            </>
          </Button>
        </motion.div>

        <motion.div
          className="mt-16 relative max-w-5xl mx-auto mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="/gia-heros-presentation2-1280x864.jpg"
              className="w-[100%] h-auto object-contain rounded-xl max-h-[480px] mx-auto"
              style={{ aspectRatio: '1280/864', maxWidth: '100%' }}
            >
              {/* <source src="/transparent-ROADMAP SITE.mp4" type="video/mp4" /> */}
              <source src="https://gia-files.vercel.app/gia_roadmap_video.mp4" type="video/mp4" />
            </video>
            <motion.div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
            >

            </motion.div>

          </div>
        </motion.div>



        {/* Whitepaper Sections Grid (Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {whitepaper.cards &&
            whitepaper.cards.map((card: any, index: number) => (
              <motion.div
                key={index}
                className="bg-brand-cardbg/40 backdrop-blur-sm border border-brand-secondary/20 rounded-xl p-6 
                           hover:border-brand-accent/50 transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-brand-accent mb-3">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <h3 className="text-xl font-small text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-brand-secondary text-sm">{card.description}</p>
              </motion.div>
            ))}
        </div>

        <motion.div
          className="mt-16 relative max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <img
              src="/TOKEN-ALLOCATION-WEBSITE-IMAGE-HIGH-QUALITY.jpg"
              alt="GIA Technology"
              className="w-full h-auto object-cover rounded-xl"
              style={{ maxHeight: 'calc(853px * 0.66)' }}
            />
            <motion.div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
            >

            </motion.div>

          </div>
        </motion.div>


        {/* Key Highlights */}
        <motion.div
          className="bg-gradient-to-r from-brand-secondary/10 to-brand-accent/10 rounded-2xl p-8 
                     border border-brand-secondary/20 backdrop-blur-sm"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="flex flex-col items-center lg:items-start">
              <h3 className="text-2xl font-small text-gradient mb-6 text-center lg:text-left">
                {whitepaper.key_highlights_title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {whitepaper.key_highlights &&
                  whitepaper.key_highlights.map((highlight: any, index: number) => {
                    const Icon =
                      highlightIcons[highlight.icon as keyof typeof highlightIcons] ||
                      CpuChipIcon;
                    return (
                      <motion.div
                        key={index}
                        className="flex items-start space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Icon className="w-6 h-6 text-brand-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-white font-small">{highlight.title}</h4>
                          <p className="text-brand-secondary text-sm">
                            {highlight.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <motion.div
                className="relative w-fit mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                viewport={{ once: true }}
              >
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent via-brand-secondary to-brand-accent rounded-2xl blur-sm opacity-25 group-hover:opacity-75 transition duration-1000" />

                {/* Video with Fallback */}
                <div className="relative">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/gia-heros-presentation-1280x864.jpg"
                    className="w-auto h-auto max-w-full max-h-[480px] object-contain rounded-xl"
                    style={{ aspectRatio: '1280/864' }}
                  >
                    {/* <source
                      src={whitepaper.video || '/PixVerse_V5_Image_Text_720P.mp4'}
                      type="video/mp4"
                    /> */}
                    <source src="https://gia-files.vercel.app/PixVerse_V5_Image_Text_720P_Turn_this_still_im-high.mp4" type="video/mp4" />

                  </video>
                </div>

              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
