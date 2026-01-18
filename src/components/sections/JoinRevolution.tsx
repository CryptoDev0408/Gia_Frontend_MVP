import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { CheckIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { trackEmailSignup, trackFormSubmit } from '../../utils/analytics';
import { subscribeToWaitlist } from '../../services/mailchimpClient';

type RevolutionData = {
  id: number;
  title: string;
  description: string;
  texts: string[];
  sub_description: string;
};

export const JoinRevolution: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [revolution, setRevolution] = useState<RevolutionData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [allowContact, setAllowContact] = useState(false);


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
        const res = await axios.get(`${import.meta.env.VITE_LARAVEL_BACKEND_URL}/api/revolution`);
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
      // Use the new Mailchimp-integrated endpoint
      const response = await subscribeToWaitlist({
        email: formData.email,
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone,
        source: 'join_revolution_section',
        consentGiven: allowContact
      });

      if (response.success) {
        // Track successful email signup
        trackEmailSignup('join_waitlist', true);
        trackFormSubmit('join_waitlist', true);

        alert(response.message);
        setFormData({ email: '', first_name: '', last_name: '', phone: '' });
        setAllowContact(false);
        setIsOpen(false);
      } else {
        // Show error message from backend/Mailchimp
        alert(response.message || "Failed to join waitlist. Please try again.");
        trackFormSubmit('join_waitlist', false);
      }
    } catch (error: any) {
      // Track failed signup
      trackFormSubmit('join_waitlist', false);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || "Something went wrong. Please try again.");
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
        <source src="https://gia-vercel-frontend-video-upload.vercel.app/live-wall2.mp4" type="video/mp4" />
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

          {/* Join Waitlist Button */}
          <div className="mb-8">
            <Button
              size="lg"
              variant="translucent"
              className="min-w-[200px] subscribe-me"
              onClick={() => setIsOpen(true)}
            >
              Join Waitlist
            </Button>
          </div>

          {/* Popup Modal */}
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
                </div>

                {/* Form */}
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
                                 text-white placeholder-brand-secondary/50 focus:border-brand-accent
                                 focus:outline-none transition-all"
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
                                 text-white placeholder-brand-secondary/50 focus:border-brand-accent
                                 focus:outline-none transition-all"
                        required
                      />
                      {errors.last_name && <p className="text-red-400 text-xs mt-1">{errors.last_name[0]}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-white text-xs font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 bg-white/5 border border-brand-secondary/30 rounded-lg text-sm
                               text-white placeholder-brand-secondary/50 focus:border-brand-accent
                               focus:outline-none transition-all"
                      required
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email[0]}</p>}
                  </div>

                  {/* Phone */}
                  {/* <div>
                    <label className="block text-white text-xs font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      className="w-full px-3 py-2 bg-white/5 border border-brand-secondary/30 rounded-lg text-sm
                               text-white placeholder-brand-secondary/50 focus:border-brand-accent
                               focus:outline-none transition-all"
                      required
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone[0]}</p>}
                  </div> */}

                  {/* Consent Checkbox */}
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
                </form>
              </div>
            </div>
          )}

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

      {/* Custom Style */}
      <style>
        {`
          .subscribe-me {
            font-weight: 200;
          }
        `}
      </style>
    </section>
  );
};
