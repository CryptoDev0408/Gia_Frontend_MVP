import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PrivacyPage: React.FC = () => {
  const [privacy, setPrivacy] = useState<{ privacy_title: string; privacy_description: string } | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchPrivacy = async () => {
    setLoading(true);

    // ✅ Check if cached data exists
    const cachedData = localStorage.getItem('privacyData');
    if (cachedData) {
      setPrivacy(JSON.parse(cachedData));
      setLoading(false); // don't show loader if cache exists
    }

    try {
      const res = await axios.get('https://admin.giafashion.io/api/privacy-policy');
      const privacyData = {
        privacy_title: res.data.privacy_title,
        privacy_description: res.data.privacy_description,
      };

      setPrivacy(privacyData);

      // ✅ Save fresh data to localStorage
      localStorage.setItem('privacyData', JSON.stringify(privacyData));
    } catch (err) {
      console.error('Failed to fetch privacy:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchPrivacy();
}, []);


  if (loading) return <div className="text-center py-20 text-white">Loading Privacy...</div>;
  if (!privacy) return <div className="text-center py-20 text-red-500">No data found</div>;

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 text-white mt-16">
      <h1 className="text-3xl font-small mb-6">{privacy.privacy_title}</h1>
    <p className="text-md leading-relaxed whitespace-pre-line">
    {privacy.privacy_description}
  </p>
    </div>
  );
};

export default PrivacyPage;
