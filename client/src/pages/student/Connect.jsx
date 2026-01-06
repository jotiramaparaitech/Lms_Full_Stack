import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets"; // Replace with your image path
import Footer from "../../components/student/Footer";
import { 
  FaFacebookF, 
  FaInstagram, 
  FaLinkedinIn, 
  FaTwitter, 
  FaYoutube,
  FaChevronRight 
} from "react-icons/fa";

const Connect = () => {
  const socialLinks = [
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/aparaitech",
      icon: <FaLinkedinIn className="text-2xl text-blue-700" />,
      // Changed icon bg to white to pop against the blueish section background
      iconBg: "bg-blue-50", 
      desc: "Professional updates & company news.",
    },
    {
      name: "X (Twitter)",
      url: "https://x.com/Aparaitech/with_replies",
      icon: <FaTwitter className="text-2xl text-black" />,
      iconBg: "bg-gray-100",
      desc: "Real-time updates & discussions.",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/aparaitech_global/",
      icon: <FaInstagram className="text-2xl text-pink-600" />,
      iconBg: "bg-pink-50",
      desc: "Visual stories & behind-the-scenes.",
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@Aparaitech",
      icon: <FaYoutube className="text-2xl text-red-600" />,
      iconBg: "bg-red-50",
      desc: "Video tutorials, webinars & keynotes.",
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/yourpage",
      icon: <FaFacebookF className="text-2xl text-blue-600" />,
      iconBg: "bg-blue-50",
      desc: "Community group & event updates.",
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col">
      
      {/* --- BACKGROUND LAYER --- */}
      {/* This creates the full-width split colors behind the content */}
      <div className="absolute inset-0 z-0 flex flex-col lg:flex-row">
        {/* Left Side (Desktop) / Top Side (Mobile) - Greyish */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-gray-100"></div>
        
        {/* Right Side (Desktop) / Bottom Side (Mobile) - Blueish Tint */}
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-blue-50/60"></div>
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 py-12 lg:py-20 gap-12 lg:gap-24 items-center">
        
        {/* Left Side Content */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-blue-950 tracking-tight mb-4">
              Stay Connected
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-md">
              Follow us for industry insights, company news, and exclusive updates across our platforms.
            </p>
          </motion.div>

         {/* Featured Image */}
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3, duration: 0.5 }}
  // Changed: Removed 'h-64 lg:h-80', added 'h-auto', removed 'object-cover' from img
  className="hidden lg:block relative w-full h-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
>
  <img 
    src={assets.connect_img} 
    alt="Office Workspace" 
    // Changed: 'object-cover' changed to 'block' to prevent weird spacing
    className="w-full h-auto block"
  />
</motion.div>
        </div>

        {/* Right Side Content (Social Links) */}
        <div className="w-full lg:w-1/2">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-4"
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target="_blank" 
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.5 }}
                className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-blue-100/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  {/* Icon Box */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${social.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    {social.icon}
                  </div>
                  
                  {/* Text */}
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {social.name}
                    </h3>
                    <p className="text-sm text-gray-500 hidden sm:block">
                      {social.desc}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-gray-300 group-hover:text-blue-600 transition-colors">
                  <FaChevronRight size={18} />
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer - Added z-20 to ensure it sits on top of any background layers */}
      <footer className="relative z-20 w-full bg-white">
        <Footer />
      </footer>
    </div>
  );
};

export default Connect;