import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import axios from 'axios';

export const About: React.FC = () => {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Check if data exists in localStorage
    const cachedData = localStorage.getItem("aboutData");
    if (cachedData) {
      setAboutData(JSON.parse(cachedData));
      setLoading(false); // don’t show loader if cache exists
    }

    // ✅ Fetch fresh data in background
    const fetchAbout = async () => {
      try {
        const res = await axios.get("https://admin.giafashion.io/api/about");
        setAboutData(res.data);
        localStorage.setItem("aboutData", JSON.stringify(res.data));
      } catch (err) {
        console.error("Failed to fetch About data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  if (loading) {
    return <div className="text-center text-white py-20">Loading...</div>;
  }

  if (!aboutData) {
    return <div className="text-center text-red-500 py-20">Failed to load data.</div>;
  }

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-bg/50 relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-video-background-1920x1080-cover.jpg"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/live-wall2.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/80 via-brand-bg/60 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header - 2 Column Layout */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Text */}
            <div className="text-left">
              <h2 className="text-3xl md:text-3xl text-gradient mb-6 leading-tight">
                {aboutData?.title}
              </h2>
              <p className="text-md md:text-md text-brand-secondary leading-relaxed">
                {aboutData?.description}
              </p>
            </div>

            {/* Right Column - Wistia Video */}
            <div className="relative w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent via-brand-secondary to-brand-accent rounded-2xl blur-sm opacity-25 transition duration-1000" />
              <div className="relative rounded-xl overflow-hidden" style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                <iframe
                  src="https://fast.wistia.net/embed/iframe/bqn716n68w?videoFoam=true&autoPlay=true&muted=true&playsinline=true"
                  title="GIA Fashion Video"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0
                  }}
                />
              </div>
              <script src="https://fast.wistia.net/assets/external/E-v1.js" async />
            </div>
          </div>
        </motion.div>

        {/* Services */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid lg:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="flex justify-center">
              <div className="relative w-fit">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent via-brand-secondary to-brand-accent rounded-2xl blur-sm opacity-25 transition duration-1000" />
                <div className="relative">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/gia-heros-portrait-animation-864x1280.jpg"
                    className="w-auto h-auto object-contain rounded-xl lg:h-[calc(2*24rem+2rem)] max-h-[800px]"
                    style={{ aspectRatio: '864/1280' }}
                  >
                    <source src="/PixVerse_V5_Image_Text_720P_Turn_this_still_im.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {aboutData?.services?.map((service: any, index: number) => (
                  <motion.div
                    key={index}
                    className="bg-brand-cardbg/30 border border-brand-secondary/20 rounded-xl p-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-sm font-small text-white mb-3">{service.title}</h3>
                    <p className="text-sm text-brand-secondary">{service.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subsection */}
        <motion.div
          className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 rounded-2xl p-8 
                     border border-brand-accent/20 backdrop-blur-sm text-center lg:text-left"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ background: '#0e151d' }}
        >
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="justify-center mx-auto">
              <h3 className="text-xl font-small text-gradient mb-4">
                {aboutData?.sub_section?.title}
              </h3>
              <p className="text-sm text-brand-secondary mb-6">
                {aboutData?.sub_section?.description}
              </p>
              <ul className="space-y-3 flex flex-col items-center lg:items-start">
                {aboutData?.sub_section?.list?.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-center text-white">
                    <div className="w-2 h-2 bg-brand-accent rounded-full mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <div className="relative w-fit mx-auto mb-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent via-brand-secondary to-brand-accent rounded-2xl blur-sm opacity-25 transition duration-1000" />
                <div className="relative">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/gia-heros-presentation2-1280x864.jpg"
                    className="w-[100%] h-auto object-contain rounded-xl max-h-[480px] mx-auto"
                    style={{ aspectRatio: '1280/864', maxWidth: '640px' }}
                  >
                    <source src="/PixVerse_V5_Image_Text_720P_Turn_this_still_ims.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Decorative Image */}
        <motion.div
          className="mt-16 relative max-w-5xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent via-brand-secondary to-brand-accent rounded-2xl blur-sm opacity-25 transition duration-1000" />
          <div className="relative">
            <img
              src="/gia-heros-1280x853.jpg"
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
              {aboutData?.learn_more?.text && aboutData?.learn_more?.link && (
                <Button
                  size="lg"
                  variant="translucent"
                  onClick={() => window.open(aboutData.learn_more.link, '_blank')}
                  className="min-w-[200px] opacity-80 learn-more"
                >
                  {aboutData.learn_more.text}

                  <>
                    <style>
                      {`
        .learn-more {
          font-weight: 200;
      }
      `}
                    </style>
                  </>
                </Button>
              )}
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};
