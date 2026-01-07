import React, { useRef, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { motion, useAnimation, useInView } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const features = [
  {
    title: "Globalized Certificates",
    desc: "Earn professional certificates to showcase your industry-ready skills.",
    icon: assets.logo_s,
    pdf: "/sample.pdf",
    external: true,
  },
  {
    title: "Connect With Us",
    desc: "Follow our journey and never miss an important announcement.",
    icon: assets.connect_icon,
    link: "/connect",
  },
  {
    title: "Microsoft Teams",
    desc: "Collaborate with the community and work on live projects together.",
    icon: assets.microsoftTeamsIcon,
    link: "https://teams.live.com/l/community/FEAn5w7MQEcTVIEBQI",
    external: true,
  },
  {
    title: "Learn on the Go",
    desc: "Study anytime, anywhere with our mobile-friendly platform and WhatsApp community.",
    icon: assets.whatsapplogos,
    link: "https://whatsapp.com/channel/0029VbAqzsdCXC3IWPf3uG1O",
    external: true,
  },
  {
    title: "Registration",
    desc: "Create your account to access courses, certifications, and exclusive opportunities.",
    icon: assets.registrationIcon,
    actions: [
      { label: "Software Developer", type: "external", target: "https://forms.gle/duaAAf3ToFTqCFNL7" },
      { label: "Business Development Associate", type: "external", target: "https://forms.gle/SRSX9Qie8VKgYhko7 " }
    ]
  },
  {
    title: "Apply for Job",
    desc: "Explore job opportunities and apply directly through our trusted hiring partners.",
    icon: assets.Job_apply,
    actions: [
      { label: "Software Developer", type: "external", target: "https://forms.gle/duaAAf3ToFTqCFNL7" },
      { label: "Business Development Associate", type: "external", target: "https://forms.gle/igg7xaLidY7YDhcJ7" }
    ]
  },
  {
    title: "Enquiry Form",
    desc: "Have questions? Submit an enquiry and our team will get back to you quickly.",
    icon: assets.enquiryIcon,
    actions: [
      { label: "Software Developer", type: "external", target: "https://forms.gle/BxnUY2BAgSsc9T8z9" },
      { label: "Business Development Associate", type: "external", target: "https://forms.gle/9St2Uu8Ny7m4ufsv9" }
    ]
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
    const cols = 4;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const delay = col * 0.06 + row * 0.12;

    return {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay,
        type: "spring",
        stiffness: 120,
        damping: 14,
      },
    };
  },
};

const Features = () => {
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const headingControls = useAnimation();
  const gridControls = useAnimation();
  const navigate = useNavigate(); // Added for Modal navigation

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  const [isDesktop, setIsDesktop] = useState(() => {
    try {
      return window.matchMedia("(min-width: 768px)").matches;
    } catch {
      return false;
    }
  });

  const headingInView = useInView(headingRef, { amount: 0.45, once: false });
  const gridInView = useInView(gridRef, { amount: 0.2, once: false });

  useEffect(() => {
    if (headingInView) {
      headingControls.start({
        y: 0,
        opacity: 1,
        transition: { duration: 0.7, ease: "easeOut" },
      });
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

    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);

    return () => {
      mq.removeEventListener
        ? mq.removeEventListener("change", onChange)
        : mq.removeListener(onChange);
    };
  }, []);

  const openModal = (feature) => {
    setActiveFeature(feature);
    setIsModalOpen(true);
  };

  const renderCard = (f, idx) => {
    // Handle card click logic (PDF or Modal)
    const handleCardClick = () => {
      if (f.pdf) {
        window.open(f.pdf, "_blank");
      } else if (f.actions) {
        openModal(f);
      }
    };

    const CardContent = (
      <div className="flex flex-col items-center text-center min-h-[260px] h-full justify-between">
        <div className="flex flex-col items-center w-full">
          <div className="w-20 h-20 mb-4 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <img src={f.icon} alt={f.title} className="w-12 h-12 object-contain" />
          </div>

          <div className="w-full min-h-[3.5rem] flex items-start justify-center mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-[#123168] leading-snug line-clamp-2">
              {f.title}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {f.desc}
          </p>
        </div>
      </div>
    );

    const commonClasses = "lg:max-w-[300px] and lg:mx-auto group relative bg-white rounded-2xl p-4 sm:p-5 lg:p-6 cursor-pointer shadow-md hover:shadow-2xl md:hover:-translate-y-2";
    const styleProps = {
      willChange: "transform, box-shadow",
      transformStyle: "preserve-3d",
    };

    // 1. If it has actions (Modal) or is a PDF, render a Div with onClick
    if (f.actions || f.pdf) {
      return (
        <motion.div
          key={f.title}
          custom={idx}
          variants={cardVariants}
          onClick={handleCardClick}
          className={commonClasses}
          style={styleProps}
        >
          {CardContent}
        </motion.div>
      );
    }

    // 2. If it is an external link
    if (f.external) {
      return (
        <a key={f.title} href={f.link} target="_blank" rel="noopener noreferrer" className="block h-full">
          <motion.div
            custom={idx}
            variants={cardVariants}
            className={commonClasses}
            style={styleProps}
          >
            {CardContent}
          </motion.div>
        </a>
      );
    }

    // 3. If it is an internal link
    if (f.link) {
      return (
        <Link key={f.title} to={f.link} className="block h-full">
          <motion.div
            custom={idx}
            variants={cardVariants}
            className={commonClasses}
            style={styleProps}
          >
            {CardContent}
          </motion.div>
        </Link>
      );
    }

    return <div key={f.title}>{CardContent}</div>;
  };

  // Mobile card renderer (simplified version of desktop)
  const renderMobileCard = (f) => {
    const handleCardClick = () => {
        if (f.pdf) {
          window.open(f.pdf, "_blank");
        } else if (f.actions) {
          openModal(f);
        }
    };

    const CardContent = (
        <div className="flex flex-col items-center text-center gap-4">
            <img src={f.icon} alt={f.title} className="w-12 h-12" />
            <h3 className="text-lg font-semibold text-[#123168]">
            {f.title}
            </h3>
            <p className="text-sm text-gray-600">{f.desc}</p>
        </div>
    );

    const className = "bg-white rounded-2xl p-6 shadow-md cursor-pointer block h-full";

    if (f.actions || f.pdf) {
        return (
            <div key={f.title} onClick={handleCardClick} className={className}>
                {CardContent}
            </div>
        )
    }

    if (f.external) {
        return (
            <a key={f.title} href={f.link} target="_blank" rel="noopener noreferrer" className={className}>
                {CardContent}
            </a>
        );
    }
    
    if (f.link) {
        return <Link key={f.title} to={f.link} className={className}>{CardContent}</Link>;
    }

    return <div key={f.title} className={className}>{CardContent}</div>;
  }

  return (
    <section className="w-full bg-[#eaf4fb] py-12 sm:py-16 lg:py-20">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        {isDesktop ? (
          <>
            <motion.h2
              ref={headingRef}
              initial={{ opacity: 0, y: -40 }}
              animate={headingControls}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-[#1f3a8a] mb-8 sm:mb-12"
            >
              Our Features
            </motion.h2>

            <motion.div
              ref={gridRef}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
              initial="offscreen"
              animate={gridControls}
              variants={{ onscreen: {}, offscreen: {} }}
              style={{ perspective: 1200 }}
            >
              {features.map(renderCard)}
            </motion.div>
          </>
        ) : (
          <>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-[#1f3a8a] mb-8 sm:mb-12">
              Our Features
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
              {features.map(renderMobileCard)}
            </div>
          </>
        )}
      </div>

      {/* =========================
          MODAL
       ========================= */}
      {isModalOpen && activeFeature && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            {/* Added p-4 to ensure modal doesn't touch edges on small screens */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-4 text-[#123168] text-center">
              {activeFeature.title}
            </h3>

            <div className="space-y-3">
              {activeFeature.actions?.map((a, i) => (
                <button
                  key={i}
                  className="w-full py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-[#1f3a8a] hover:text-white hover:border-[#1f3a8a] transition-all duration-200"
                  onClick={() => {
                    if (a.type === "internal") navigate(a.target);
                    if (a.type === "external")
                      window.open(a.target, "_blank");
                    setIsModalOpen(false);
                    setActiveFeature(null);
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <button
              className="mt-5 w-full py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              onClick={() => {
                setIsModalOpen(false);
                setActiveFeature(null);
              }}
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default Features;