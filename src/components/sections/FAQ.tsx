import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

type FAQItem = {
  title: string;
  description: string;
};

type SocialButton = {
  name: string;
  link: string;
};

type FAQData = {
  title: string;
  description: string;
  faqs: FAQItem[];
  sub_description: string;
  social_buttons: SocialButton[];
};

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqData, setFaqData] = useState<FAQData | null>(null);

  useEffect(() => {
    // ✅ Check localStorage first
    const cached = localStorage.getItem("faqData");
    if (cached) {
      const parsed = JSON.parse(cached);

      // Make sure FAQs are in array format
      if (parsed.faqs && typeof parsed.faqs === "object" && !Array.isArray(parsed.faqs)) {
        parsed.faqs = Object.values(parsed.faqs);
      }

      // Parse social_buttons if stored as string
      if (typeof parsed.social_buttons === "string") {
        try {
          parsed.social_buttons = JSON.parse(parsed.social_buttons);
        } catch {
          parsed.social_buttons = [];
        }
      }

      setFaqData(parsed);
    }

    // ✅ Always fetch fresh FAQs from API
    const fetchFaqs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_LARAVEL_BACKEND_URL}/api/faqs`);
        let data = res.data;

        // Convert faqs object → array
        if (data.faqs && typeof data.faqs === "object" && !Array.isArray(data.faqs)) {
          data.faqs = Object.values(data.faqs);
        }

        // Parse social_buttons
        if (typeof data.social_buttons === "string") {
          try {
            data.social_buttons = JSON.parse(data.social_buttons);
          } catch {
            data.social_buttons = [];
          }
        }

        setFaqData(data);
        localStorage.setItem("faqData", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to fetch FAQ data:", err);
      }
    };

    fetchFaqs();
  }, []);


  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqData) {
    return <div className="text-center text-white py-20">Loading FAQs...</div>;
  }

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-bg/50 relative overflow-hidden">
      {/* Background Video */}
      <video
        key="faq-bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-video-background-1920x1080-cover.jpg"
        className="absolute inset-0 w-full h-full object-cover"
        onLoadedData={(e) => {
          const video = e.currentTarget;
          video.play().catch(err => console.log('FAQ background video autoplay prevented:', err));
        }}
      >
        <source src="/live-wall2.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/80 via-brand-bg/70 to-brand-bg/80" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Decorative Image */}
          <motion.div
            className="hidden lg:block lg:sticky lg:top-20"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-xl overflow-hidden">
              <img
                src="/gia-heros-portrait-853x1280.jpg"
                alt="GIA Portrait"
                className="w-full h-auto object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/20 to-transparent" />
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            {/* Section Header */}
            <motion.div
              className="text-center lg:text-left mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-3xl text-gradient mb-6 leading-tight">
                {faqData.title}
              </h2>
              <p className="text-lg md:text-lg text-brand-secondary max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                {faqData.description}
              </p>
            </motion.div>

            {/* FAQ Items */}
            <div className="space-y-4 mb-12">
              {faqData.faqs.map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-brand-cardbg/30 backdrop-blur-sm border border-brand-secondary/20 rounded-xl overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-brand-bg/50 transition-colors duration-200"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="text-lg font-small text-white">{item.title}</span>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDownIcon className="w-5 h-5 text-brand-accent" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4">
                          <p className="text-brand-secondary leading-relaxed text-sm">{item.description}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Social Buttons */}
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-brand-secondary mb-6">{faqData.sub_description}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {faqData.social_buttons.map((btn, i) => (
                  <a
                    key={i}
                    href={btn.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 border border-brand-accent text-brand-accent rounded-lg font-semibold 
                               hover:bg-brand-accent/10 transition-colors duration-200 text-center"
                  >
                    {btn.name} →
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
