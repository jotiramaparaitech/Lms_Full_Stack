import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import emailjs from "@emailjs/browser";

const Footer = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Smooth scroll to a section on the same page
  const handleScroll = (targetId) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle footer link clicks
  const handleLinkClick = (link) => {
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

  // Handle subscription
  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter a valid email.");
      return;
    }

    setMessage("Processing..."); // show immediately

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
        "gpm7Cf-quPRpX09xI"
      )
      .then(
        (response) => {
          setMessage("Subscription successful! Check your inbox.");
          setEmail(""); // clear input immediately
        },
        (error) => {
          setMessage("Failed to subscribe. Please try again.");
        }
      );
  };

  return (
    <footer
      id="contact-section"
      className="relative w-full bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white pt-10 pb-8 px-6 md:px-20 lg:px-32"
    >
      {/* Top Animated Gradient Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-600 animate-gradient-x"></div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-12 border-b border-white/10 pb-12 relative z-10">
        {/* Brand Section */}
        <div className="flex flex-col md:items-start items-center md:w-1/3 w-full">
          <img
            src={assets.logo1}
            alt="logo"
            className="w-32 md:w-40 mb-5 rounded-1xl shadow-lg hover:brightness-110 transition-all duration-300"
          />
          <p className="text-sm text-gray-400 text-center md:text-left leading-relaxed">
            Empowering learners and educators through innovation, technology,
            and meaningful learning experiences worldwide.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-6">
            {[
              { Icon: FaFacebookF, link: "https://www.facebook.com/yourpage" },
              { Icon: FaTwitter, link: "https://twitter.com/yourprofile" },
              {
                Icon: FaInstagram,
                link: "https://www.instagram.com/aparaitech_global/",
              },
              {
                Icon: FaLinkedinIn,
                link: "https://www.linkedin.com/company/aparaitech",
              },
              { Icon: FaYoutube, link: "https://www.youtube.com/@Aparaitech" },
            ].map(({ Icon, link }, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:scale-110 transition-all duration-300"
              >
                <Icon className="text-white text-lg" />
              </a>
            ))}
          </div>
        </div>

        {/* Company Links */}
        <div className="flex flex-col md:w-1/4 w-full md:items-start items-center">
          <h2 className="font-semibold text-lg mb-4 relative after:content-[''] after:block after:w-10 after:h-[2px] after:bg-blue-500 after:mt-1">
            Company
          </h2>

          <ul className="space-y-3 text-gray-400">
            {[
              { name: "Home", id: "hero" },
              { name: "About us", route: "/about" },
              { name: "Project", route: "/course-list" },
              { name: "Contact us", id: "contact-section" },
              { name: "Privacy policy" },
            ].map((link, i) => (
              <li key={i}>
                <a
                  href="#"
                  onClick={() => handleLinkClick(link)}
                  className="hover:text-blue-400 hover:pl-1 transition-all duration-300"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter Section */}
        <div className="flex flex-col md:w-1/3 w-full md:items-start items-center">
          <h2 className="font-semibold text-lg mb-4 relative after:content-[''] after:block after:w-10 after:h-[2px] after:bg-purple-500 after:mt-1">
            Stay Updated
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed text-center md:text-left">
            Subscribe to our newsletter and receive the latest insights,
            tutorials, and exclusive updates directly to your inbox.
          </p>

          <div className="flex flex-col gap-2 mt-5 w-full max-w-md">
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gray-800/70 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 outline-none text-sm transition-all duration-300 
        focus:border-blue-500 focus:ring-2 focus:ring-blue-400 
        hover:border-cyan-400 hover:bg-gray-800 hover:shadow-[0_0_10px_1px_rgba(56,189,248,0.3)]"
              />
              <button
                onClick={handleSubscribe}
                className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-300 ${
                  message.includes("successful") ? "opacity-90" : ""
                }`}
              >
                {message.includes("Processing") ? "Processing..." : "Subscribe"}
              </button>
            </div>

            {message && (
              <p
                className={`text-sm ${
                  message.includes("successful")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>
          Copyright {new Date().getFullYear()} ©
          <span className="font-semibold text-white"> Aparaitech</span>. All
          rights reserved.
        </p>
      </div>

      {/* Gradient Animation Keyframes */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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
