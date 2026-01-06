import React, { useRef, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { motion, useAnimation, useInView } from "framer-motion";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Globalized Certificates",
    desc: "Earn professional certificates to showcase your industry-ready skills.",
    icon: assets.logo,
    pdf: "/sample.pdf",
    external: true, 
  },
  {
    title: "Connect With Us",
    desc: "Follow our journey and never miss an important announcement.",
    icon: assets.blue_tick_icon,
    link: "/connect",
  },
  {
    title: "Microsoft Teams",
    desc: "Collaborate with the community and work on live projects together.",
    icon: assets.microsoftTeamsIcon,
    link: "https://teams.live.com/l/community/FEAn5w7MQEcTVIEBQI",
    external: true, // mark external links
  },
  {
    title: "Learn on the Go",
    desc: "Study anytime, anywhere with our mobile-friendly platform and exclusive WhatsApp community.",
    icon: assets.whatsapplogos,
    link: "https://whatsapp.com/channel/0029VbAqzsdCXC3IWPf3uG1O",
    external: true,
  },
  {
    title: "Support Query",
    desc: "Ask your questions and get support instantly from our dedicated team.",
    icon: assets.supportIcon,
    link: "https://forms.gle/KMPcsShqiW1MCSLdA",
    external: true,
  },
];

const cardVariants = {
  offscreen: (i) => ({ y: 120, opacity: 0, scale: 0.98 }),
  onscreen: (i) => {
    const cols = 5;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const delay = col * 0.06 + row * 0.12;
    return {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { delay, type: "spring", stiffness: 120, damping: 14 },
    };
  },
};

const Features = () => {
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const headingControls = useAnimation();
  const gridControls = useAnimation();

  const [isDesktop, setIsDesktop] = useState(() => {
    try {
      return window.matchMedia("(min-width: 768px)").matches;
    } catch (e) {
      return false;
    }
  });

  const headingInView = useInView(headingRef, { amount: 0.45, once: false });
  const gridInView = useInView(gridRef, { amount: 0.2, once: false });

  useEffect(() => {
    if (headingInView) {
      headingControls.start({ y: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut" } });
    } else {
      headingControls.set({ y: -40, opacity: 0 });
    }
  }, [headingInView, headingControls]);

  useEffect(() => {
    if (gridInView) {
      gridControls.start("onscreen");
    } else {
      gridControls.set("offscreen");
    }
  }, [gridInView, gridControls]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e) => setIsDesktop(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  // --- DESKTOP CARD RENDER LOGIC (Modified for alignment) ---
  const renderCard = (f, idx) => {
    const handleClick = () => {
      if (f.pdf) {
        window.open(f.pdf, "_blank"); // open PDF in new tab
      }
    };

    const Card = (
      <motion.div
        custom={idx}
        variants={cardVariants}
        onClick={handleClick}
        // Removed 'justify-between', added 'items-center' and removed 'min-h' reliance for layout
        className="group relative bg-white rounded-2xl p-4 sm:p-5 lg:p-6 transform-gpu transition-all duration-400 ease-out cursor-pointer shadow-md hover:shadow-2xl md:hover:-translate-y-2
                  flex flex-col items-center text-center min-h-[260px]"
        style={{
          willChange: "transform, box-shadow",
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
      >
        {/* 1. Fixed Icon Height Container */}
        <div className="w-20 h-20 mb-4 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
          <img
            src={f.icon}
            alt={f.title}
            className="w-12 h-12 object-contain"
          />
        </div>

        {/* 2. Fixed Title Height Container (forces description alignment) */}
        <div className="w-full min-h-[3.5rem] flex items-start justify-center mb-2">
          <h3 className="text-base sm:text-lg font-semibold text-[#123168] leading-snug line-clamp-2">
            {f.title}
          </h3>
        </div>

        {/* 3. Description */}
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {f.desc}
        </p>
      </motion.div>
    );

    if (f.external && !f.pdf) {
      return (
        <a key={f.title} href={f.link} target="_blank" rel="noopener noreferrer" className="block h-full">
          {Card}
        </a>
      );
    } else if (f.link && !f.pdf) {
      return (
        <Link key={f.title} to={f.link} className="block h-full">
          {Card}
        </Link>
      );
    } else {
      return <div key={f.title} className="h-full">{Card}</div>;
    }
  };


  return (
    <section className="w-full bg-[#eaf4fb] py-12 sm:py-16 lg:py-20">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        {isDesktop ? (
          <>
            <motion.h2
              ref={headingRef}
              initial={{ opacity: 0, y: -40 }}
              animate={headingControls}
              viewport={{ once: false, amount: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-[#1f3a8a] mb-8 sm:mb-12"
            >
              Our Features
            </motion.h2>

            <motion.div
              ref={gridRef}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6"
              initial="offscreen"
              animate={gridControls}
              variants={{ onscreen: {}, offscreen: {} }}
              style={{ perspective: 1200 }}
            >
              {features.map(renderCard)}
            </motion.div>
          </>
        ) : (
          // --- MOBILE VIEW (Unchanged) ---
          <>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-[#1f3a8a] mb-8 sm:mb-12">
              Our Features
            </h2>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8"
              style={{ perspective: 1200 }}
            >
              {features.map((f) => {
                const handleClick = () => {
                  if (f.pdf) {
                    window.open(f.pdf, "_blank");
                  }
                };

                const CardContent = (
                  <div
                    className="group relative bg-white rounded-2xl p-6 md:p-8 lg:p-10 transform-gpu transition-all duration-400 ease-out cursor-pointer shadow-md"
                    style={{
                      willChange: "transform, box-shadow",
                      transformStyle: "preserve-3d",
                      transformOrigin: "center center",
                    }}
                    onClick={handleClick}
                  >
                    <div className="flex flex-col items-center gap-4 sm:gap-5 h-full text-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <img
                          src={f.icon}
                          alt={f.title}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                        />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-[#123168] leading-6">
                        {f.title}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-sm text-gray-600 max-w-none md:max-w-xs">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );

                if (f.external && !f.pdf) {
                  return (
                    <a key={f.title} href={f.link} target="_blank" rel="noopener noreferrer">
                      {CardContent}
                    </a>
                  );
                } else if (f.link && !f.pdf) {
                  return (
                    <Link key={f.title} to={f.link}>
                      {CardContent}
                    </Link>
                  );
                } else {
                  return <div key={f.title}>{CardContent}</div>;
                }
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Features;