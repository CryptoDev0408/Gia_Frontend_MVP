import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useTypingAnimation } from '../../hooks/useTypingAnimation';

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
  axios.get('https://admin.giafashion.io/api/hero')
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
      window.open(btn.link, '_blank');
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

              <div className="flex items-center justify-center space-x-4 ">
 <div
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
{heroData.socials[0] && (
  <a
    href={heroData.socials[0].link}
    target="_blank"
    rel="noopener noreferrer"
  >
    {/* Static SVG */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
    >
      <rect width="30" height="30" fill="url(#pattern0_4_271)" />
      <defs>
        <pattern
          id="pattern0_4_271"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_4_271" transform="scale(0.01)" />
        </pattern>
        <image
          id="image0_4_271"
          width="100"
          height="100"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  </a>
)}

</div>

               <div
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
     {heroData.socials[1] && (
  <a
    href={heroData.socials[1].link}
    target="_blank"
    rel="noopener noreferrer"
  >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
      >
        <rect width="30" height="30" fill="url(#pattern0_4_272)" />
        <defs>
          <pattern
            id="pattern0_4_272"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <use xlinkHref="#image0_4_272" transform="scale(0.01)" />
          </pattern>
          <image
            id="image0_4_272"
            width="100"
            height="100"
            preserveAspectRatio="none"
            xlinkHref="data:image/png;base64,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"
          />
        </defs>
      </svg>
      </a>
      )}
    </div>


  

<div
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
    {heroData.socials[1] && (
  <a
    href={heroData.socials[1].link}
    target="_blank"
    rel="noopener noreferrer"
  >
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
    <path d="M6.57308 7.95258C5.55326 8.06364 5.16515 7.68684 2.71676 4.18457L0 0.297561H9.36003L12.114 4.16474C13.6334 6.29069 15.3509 8.68635 16.9983 10.9472L21.7465 5.63624C26.1189 0.741791 26.6102 0.321359 27.9397 0.293595C29.2857 0.265831 29.3435 0.30946 28.7655 0.975804C28.4228 1.3645 25.9703 4.09334 23.3113 7.04033C20.6482 9.98334 18.4682 12.5297 18.4599 12.6923C18.4517 12.855 19.649 14.6834 21.1272 16.7578C22.6053 18.8283 23.6705 20.6052 23.5012 20.7043C23.332 20.7995 22.6837 20.7559 22.0603 20.6052C21.1643 20.3831 19.6119 18.4753 8.22874 2.47904L6.31709 2.37989C5.26424 2.32436 4.40132 2.41558 4.39719 2.5782C4.38893 2.74082 5.13212 3.90296 6.04872 5.15632C6.96119 6.40968 7.7085 7.52818 7.7085 7.63528C7.7085 7.74237 7.19653 7.88912 6.57308 7.95258Z" fill="url(#paint0_linear_4_273)" fillOpacity="0.47"/>
    <path d="M7.84063 21.1208C9.40132 19.3756 11.2386 17.3647 11.9323 16.6587C12.6218 15.9487 13.2824 15.3696 13.398 15.3696C13.5178 15.3696 14.0958 16.0875 14.6862 16.972C15.6235 18.3721 15.6936 18.6934 15.2395 19.5501C14.9587 20.0856 14.8348 20.748 14.967 21.0216C15.0991 21.2914 14.8266 21.0692 14.3559 20.5259C13.8893 19.9785 13.5012 19.3994 13.4971 19.2368C13.4889 19.0702 13.2989 18.9393 13.0718 18.9393C12.8448 18.9393 10.4789 21.3509 7.8076 24.3018C3.31544 29.2716 2.85301 29.6682 0.0660611 29.6801L2.53922 26.987C3.8976 25.5036 6.28406 22.866 7.84063 21.1208Z" fill="url(#paint1_linear_4_273)" fillOpacity="0.47"/>
    <path d="M17.4071 24.2304C17.18 24.2661 16.9405 23.4451 16.8704 22.4099C16.8002 21.3707 16.8745 20.5259 17.0314 20.5259C17.1924 20.5259 17.7622 21.2398 18.2948 22.1124C18.8274 22.985 19.2651 23.9647 19.2651 24.2939C19.2651 24.7302 19.0751 24.7936 18.5425 24.5279C18.1462 24.3335 17.6342 24.1987 17.4071 24.2304Z" fill="url(#paint2_linear_4_273)" fillOpacity="0.47"/>
    <path d="M23.6003 22.7073C24.0297 22.8422 24.2155 22.632 24.2073 22.0132C24.199 21.2557 24.3765 21.3588 25.3675 22.7073C26.0116 23.5799 27.3204 25.4084 28.27 26.7728C29.2238 28.1333 30 29.339 30 29.4501C30 29.5572 28.6994 29.6484 27.1098 29.6484C24.3022 29.6484 24.2197 29.6167 24.2197 28.6568C24.2197 27.927 24.4426 27.6653 25.0454 27.6653C25.4996 27.6653 25.8712 27.574 25.8712 27.4669C25.8712 27.3559 25.223 26.3286 24.4261 25.1863C23.6292 24.04 22.981 22.9691 22.981 22.8065C22.981 22.6399 23.2618 22.5963 23.6003 22.7073Z" fill="url(#paint3_linear_4_273)" fillOpacity="0.47"/>
    <path d="M8.53422 12.395C6.94462 10.1025 5.64404 8.13915 5.64404 8.03206C5.64404 7.92497 6.20143 7.83374 6.88269 7.83374C7.98095 7.83374 8.42274 8.25417 10.7514 11.5026C13.2122 14.9295 13.3402 15.2191 12.7126 15.8775C12.3451 16.2662 11.9033 16.5795 11.7341 16.5716C11.5648 16.5636 10.1238 14.6876 8.53422 12.395Z" fill="url(#paint4_linear_4_273)" fillOpacity="0.47"/>
    <path d="M15.6564 22.1046C14.8678 20.7679 14.8018 20.3753 15.2188 19.5344L15.706 18.5468L16.2014 19.4194C16.4739 19.8954 16.701 21.0099 16.7093 21.8944C16.7134 22.7789 16.6886 23.5404 16.6515 23.592C16.6143 23.6435 16.1684 22.9732 15.6564 22.1046Z" fill="url(#paint5_linear_4_273)" fillOpacity="0.47"/>
    <path d="M21.99 21.9103C21.6432 21.474 21.3542 20.9861 21.3459 20.8235C21.3377 20.6609 21.9322 20.5934 22.6754 20.6688C23.7819 20.7838 24.0379 20.9901 24.1246 21.8547C24.2031 22.6916 24.0627 22.882 23.4227 22.8027C22.981 22.7511 22.3369 22.3465 21.99 21.9103Z" fill="url(#paint6_linear_4_273)" fillOpacity="0.47"/>
    <path d="M18.4475 24.4884C19.1164 24.8096 19.2733 24.7541 19.2691 24.1909C19.2691 23.7982 19.8926 24.3932 20.7142 25.5791C21.8166 27.1656 22.407 27.6614 23.1957 27.6614C24.0214 27.6614 24.2279 27.8598 24.2279 28.653C24.2279 29.5692 24.0957 29.6406 22.4855 29.5454C20.867 29.4542 20.6234 29.2797 19.0132 27.0665C18.0594 25.7576 17.3575 24.5558 17.4525 24.3892C17.5433 24.2266 17.9933 24.2702 18.4475 24.4884Z" fill="url(#paint7_linear_4_273)" fillOpacity="0.47"/>
    <defs>
      <linearGradient id="paint0_linear_4_273" x1="13.8886" y1="0.297561" x2="13.8886" y2="20.7043" gradientUnits="userSpaceOnUse">
        <stop stopColor="#95A4FC"/>
        <stop offset="1" stopColor="#C2D9FF"/>
      </linearGradient>
      <linearGradient id="paint1_linear_4_273" x1="7.98151" y1="15.3696" x2="7.98151" y2="29.6801" gradientUnits="userSpaceOnUse">
        <stop stopColor="#BAEDBD"/>
        <stop offset="1" stopColor="#E0FCD9"/>
      </linearGradient>
      <linearGradient id="paint2_linear_4_273" x1="18.0676" y1="20.5259" x2="18.0676" y2="24.7936" gradientUnits="userSpaceOnUse">
        <stop stopColor="#000000"/>
        <stop offset="1" stopColor="#4F4F4F"/>
      </linearGradient>
      <linearGradient id="paint3_linear_4_273" x1="26.4903" y1="22.5963" x2="26.4903" y2="29.6484" gradientUnits="userSpaceOnUse">
        <stop stopColor="#B1E3FF"/>
        <stop offset="1" stopColor="#D6F5FF"/>
      </linearGradient>
      <linearGradient id="paint4_linear_4_273" x1="9.19599" y1="7.83374" x2="9.19599" y2="16.5795" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A8C5DA"/>
        <stop offset="1" stopColor="#D7E6F1"/>
      </linearGradient>
      <linearGradient id="paint5_linear_4_273" x1="15.9554" y1="18.5468" x2="15.9554" y2="23.6435" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A1E3CB"/>
        <stop offset="1" stopColor="#D2F5E2"/>
      </linearGradient>
      <linearGradient id="paint6_linear_4_273" x1="22.7352" y1="20.5934" x2="22.7352" y2="22.882" gradientUnits="userSpaceOnUse">
        <stop stopColor="#95A4FC"/>
        <stop offset="1" stopColor="#C2D9FF"/>
      </linearGradient>
      <linearGradient id="paint7_linear_4_273" x1="20.3436" y1="24.1909" x2="20.3436" y2="29.6406" gradientUnits="userSpaceOnUse">
        <stop stopColor="#BAEDBD"/>
        <stop offset="1" stopColor="#E0FCD9"/>
      </linearGradient>
    </defs>
  </svg>
  </a>
      )}

</div>
</div>


           
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};