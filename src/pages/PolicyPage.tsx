import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PolicyPage: React.FC = () => {
  const [policy, setPolicy] = useState<{ policy_title: string; policy_description: string } | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchPolicy = async () => {
    setLoading(true);

    // ✅ Check if cached data exists
    const cachedData = localStorage.getItem('policyData');
    if (cachedData) {
      setPolicy(JSON.parse(cachedData));
      setLoading(false); // don’t show loader if cache exists
    }

    try {
      const res = await axios.get(`${import.meta.env.VITE_LARAVEL_BACKEND_URL}/api/privacy-policy`);
      const policyData = {
        policy_title: res.data.policy_title,
        policy_description: res.data.policy_description,
      };

      setPolicy(policyData);

      // ✅ Save fresh data to localStorage
      localStorage.setItem('policyData', JSON.stringify(policyData));
    } catch (err) {
      console.error('Failed to fetch policy:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchPolicy();
}, []);


  if (loading) return <div className="text-center py-20 text-white">Loading Policy...</div>;
  if (!policy) return <div className="text-center py-20 text-red-500">No data found</div>;

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 text-white mt-16">
      <h1 className="text-3xl font-small mb-6">{policy.policy_title}</h1>
      <p
    className="text-md leading-relaxed"
    dangerouslySetInnerHTML={{
      __html: policy.policy_description.replace(/\r\n\r\n/g, "<br /><br />"),
    }}
  />
    </div>
  );
};

export default PolicyPage;
