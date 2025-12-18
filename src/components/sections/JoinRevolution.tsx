import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { CheckIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

type RevolutionData = {
  id: number;
  title: string;
  description: string;
  texts: string[];
  sub_description: string;
};

export const JoinRevolution: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [revolution, setRevolution] = useState<RevolutionData | null>(null);
  

  useEffect(() => {
    // ✅ Check localStorage first
    const cached = localStorage.getItem("revolutionData");
    if (cached) {
      const parsed = JSON.parse(cached);
      parsed.texts =
        typeof parsed.texts === "string" ? JSON.parse(parsed.texts) : parsed.texts;
      setRevolution(parsed);
    }

    // ✅ Always fetch fresh data
    const fetchRevolution = async () => {
      try {
        const res = await axios.get("https://admin.giafashion.io/api/revolution");
        const data = res.data;
        data.texts = typeof data.texts === "string" ? JSON.parse(data.texts) : data.texts;

        setRevolution(data);
        localStorage.setItem("revolutionData", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to fetch revolution data:", err);
      }
    };

    fetchRevolution();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("https://admin.giafashion.io/api/newsletter", {
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


  if (!revolution) {
    return <div className="text-center text-white py-20">Loading Revolution...</div>;
  }

  return (
    <section id="join" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-video-background-1920x1080-cover.jpg"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectFit: 'cover' }}
      >
        <source src="/live-wall2.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/80 via-brand-bg/70 to-brand-bg/80" />

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-3xl text-gradient mb-6 leading-tight">
            {revolution.title}
          </h2>
          <p className="text-lg md:text-lg text-white mb-8 leading-relaxed">
            {revolution.description}
          </p>

          {/* Email Form */}
           <form onSubmit={handleSubmit} className="mb-8">
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
           <>
    <style>
      {`
        .subscribe-me {
          font-weight: 200;
      }
      `}
    </style>
  </>
        </Button>
      </div>
    </form>

          {/* Dynamic Benefits (texts JSON) */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              {revolution.texts.map((text, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <CheckIcon className="w-20 h-20 text-brand-accent mr-2" />
                  <span className="text-sm text-white font-small">{text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/80">
            {revolution.sub_description}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
