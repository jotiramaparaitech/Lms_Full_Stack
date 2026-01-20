import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import emailjs from "@emailjs/browser";

const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleScroll = (targetId) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLinkClick = (link, e) => {
    e.preventDefault();
    if (link.id === "hero") {
      if (window.location.pathname === "/") {
        handleScroll("hero");
      } else {
        navigate("/");
        setTimeout(() => handleScroll("hero"), 300);
      }
    } else if (link.id === "contact-section") {
      handleScroll("contact-section");
    } else if (link.route) {
      navigate(link.route);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter a valid email.");
      return;
    }

    setMessage("Processing...");

    const templateParams = {
      to_email: email,
      from_name: "Aparaitech",
      message: "Thank you for subscribing to our newsletter!",
    };

    emailjs
      .send(
        "service_wdj15jn",
        "template_xtmll8h",
        templateParams,
        "gpm7Cf-quPRpX09xI",
      )
      .then(
        (response) => {
          setMessage("✓ Subscription successful! Check your inbox.");
          setEmail("");
        },
        (error) => {
          setMessage("Failed to subscribe. Please try again.");
        },
      );
  };

  return (
    <footer
      id="contact-section"
      className="w-full bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white pt-0 pb-3"
    >
      {/* Enhanced Top Gradient Border */}
      <div className="h-[2px] bg-gradient-to-r animate-gradient-x shadow-lg shadow-blue-500/20"></div>

      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

      {/* Main Content - True Full Width */}
      <div className="relative z-10 w-full flex flex-col md:flex-row justify-between gap-8 md:gap-4 px-0 py-1 mt-5">
        {/* Brand & Contact Section - Enhanced - Fixed responsive spacing */}
        <div className="flex flex-col items-center md:items-start w-full md:w-2/5 px-4 sm:px-6 md:px-8">
          {/* Premium Logo Container - Reduced bottom margin on mobile */}
          <div className="relative mb-4 md:mb-6 group">
            <div className="overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-blue-900/30 via-gray-900/50 to-purple-900/30 border border-white/15 p-3 backdrop-blur-sm">
              <div className="relative">
                <img
                  // src={logo}
                  src={assets.logof}
                  alt="Aparaitech Logo"
                  className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-xl transition-all duration-500 group-hover:scale-[1.04] group-hover:brightness-110 group-hover:shadow-2xl object-cover"
                />
                {/* Subtle Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          {/* Enhanced Company Description - Updated with contact info - Reduced spacing on mobile */}
          <div className="text-sm md:text-base text-gray-300 text-center md:text-left leading-relaxed mb-4 md:mb-6 font-light tracking-wide space-y-2 md:space-y-3">
            {/* Contact Details - Adjusted spacing and alignment for mobile */}
            <div className="space-y-1 md:space-y-2 pt-0 md:pt-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <FaPhone className="text-blue-400 flex-shrink-0" />
                <span className="text-sm sm:text-base">
                  <strong>Mobile:</strong> +91 63643 26342
                </span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2">
                <FaEnvelope className="text-blue-400 flex-shrink-0" />
                <span className="text-sm sm:text-base">
                  <strong>Email:</strong> info@aparaitechsoftware.org
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm md:text-base text-center md:text-left">
                {/* Branch Address */}
                <div>
                  <div className="flex justify-center md:justify-start items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-400 flex-shrink-0" />
                    <span className="font-medium">Branch Address:</span>
                  </div>
                  <div className="mt-1 md:ml-6">
                    360, Neeladri Rd, Karuna Nagar, Electronic City Phase I,
                    <br />
                    Electronic City, Bengaluru, Karnataka 560100
                  </div>
                </div>

                {/* New Branch */}
                <div>
                  <div className="flex justify-center md:justify-start items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-400 flex-shrink-0" />
                    <span className="font-medium">New Branch:</span>
                  </div>
                  <div className="mt-1 md:ml-6">
                    Mukti Complex, Near Prashaskiya Bhawan, Baramati
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Company Links - Fixed hover area and layout stability */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/4 px-4 sm:px-6 md:px-8">
          <h2 className="font-semibold text-lg mb-6 relative inline-block">
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Company
            </span>
            <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></span>
          </h2>

          <ul className="space-y-3 w-full">
            {[
              { name: "Home", id: "hero" },
              { name: "About Us", route: "/about" },
              { name: "Project", route: "/course-list" },
              { name: "Contact", route: "/contact" },
            ].map((link, i) => (
              <li
                key={i}
                className="min-h-[1rem] justify-center md:justify-between flex items-center"
              >
                <button
                  onClick={(e) => handleLinkClick(link, e)}
                  className="inline-flex items-center text-gray-400 hover:text-white text-sm 
                            transition-colors duration-200 relative group/link
                            h-full"
                  style={{
                    transform: "translateZ(0)",
                    willChange: "color",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <span className="relative py-1">
                    {link.name}
                    <span
                      className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 
                                    group-hover/link:w-full transition-all duration-300"
                    ></span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Enhanced Newsletter Section with Social Icons */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3 px-4 sm:px-6 md:px-8">
          <h2 className="font-semibold text-lg mb-6 relative inline-block">
            <span className="bg-gradient-to-r  from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Stay Updated
            </span>
            <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-gradient-to-r  from-blue-400 to-blue-600 rounded-full"></span>
          </h2>

          <p className="text-gray-300 text-sm leading-relaxed text-center md:text-left mb-6">
            Subscribe to our newsletter and receive the latest insights,
            tutorials, and exclusive updates directly to your inbox.
          </p>

          <form onSubmit={handleSubscribe} className="w-full">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700/50 text-white 
                             placeholder-gray-400 rounded-xl px-4 py-3.5 pr-12 outline-none 
                             text-sm transition-all duration-300 
                             focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 
                             focus:bg-gray-800/70 hover:border-gray-600 hover:bg-gray-800/60
                             shadow-inner"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  type="submit"
                  className="relative bg-gradient-to-r from-blue-600 to-purple-600 
                            text-white font-medium px-6 py-3.5 rounded-xl shadow-lg 
                            transition-all duration-300 hover:shadow-xl 
                            hover:from-blue-700 hover:to-purple-700 
                            hover:scale-[1.02] active:scale-[0.98]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            whitespace-nowrap group"
                  disabled={message.includes("Processing")}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {message.includes("Processing") ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Subscribe
                        <svg
                          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/0 via-white/10 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>

              {message && (
                <div
                  className={`px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                    message.includes("✓")
                      ? "bg-green-900/20 text-green-300 border-green-800/30"
                      : "bg-red-900/20 text-red-300 border-red-800/30"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    {message.includes("✓") ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {message}
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Social Icons moved to below the newsletter form */}
          <div className="mt-3">
            <h3 className="font-semibold text-sm mb-2 text-gray-300 text-center md:text-left">
              Connect Us
            </h3>
            <div className="flex gap-3 justify-center md:justify-start">
              {[
                {
                  Icon: FaLinkedinIn,
                  link: "https://www.linkedin.com/company/aparaitech",
                  color: "group-hover:text-blue-700",
                  bg: "group-hover:bg-blue-700/20",
                  glow: "group-hover:shadow-blue-500/30",
                },
                {
                  Icon: FaYoutube,
                  link: "https://www.youtube.com/@Aparaitech",
                  color: "group-hover:text-red-600",
                  bg: "group-hover:bg-red-600/20",
                  glow: "group-hover:shadow-red-500/30",
                },
                {
                  Icon: FaInstagram,
                  link: "https://www.instagram.com/aparaitech_global/",
                  color: "group-hover:text-pink-600",
                  bg: "group-hover:bg-gradient-to-br group-hover:from-pink-600/20 group-hover:to-yellow-500/20",
                  glow: "group-hover:shadow-pink-500/30",
                },
                {
                  Icon: FaFacebookF,
                  link: "https://www.facebook.com/profile.php?id=61586032508393",
                  color: "group-hover:text-blue-600",
                  bg: "group-hover:bg-blue-600/20",
                  glow: "group-hover:shadow-blue-500/30",
                },
                {
                  Icon: FaXTwitter,
                  link: "https://x.com/Aparaitech",
                  color: "text-white group-hover:text-white",
                  bg: "bg-black/30 group-hover:bg-black/50",
                  glow: "group-hover:shadow-black/50",
                },
              ].map(({ Icon, link, color, bg, glow }, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative p-3 rounded-xl bg-white/5 text-gray-300 
                            transition-all duration-300 hover:scale-110 
                            ${bg} ${glow} hover:shadow-lg border border-white/10 
                            hover:border-white/20`}
                  style={{
                    animation: `gentlePulse 4s ease-in-out ${
                      idx * 0.1
                    }s infinite`,
                  }}
                >
                  <Icon
                    className={`text-lg transition-colors duration-300 ${color}`}
                  />
                  {/* Subtle Ring Effect on Hover */}
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-current group-hover:opacity-20 transition-all duration-500"></div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes gentlePulse {
          0%, 100% {
            transform: scale(1) translateZ(0);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          50% {
            transform: scale(1.05) translateZ(0);
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
          }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
