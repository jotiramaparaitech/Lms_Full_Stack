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
    external: true
  },
  {
    title: "Connect With Us",
    desc: "Follow our journey and never miss an important announcement.",
    icon: assets.connect_icon,
    link: "/connect",
    cta: "Follow Now"
  },
  {
    title: "Microsoft Teams",
    desc: "Collaborate with the community and work on live projects together.",
    icon: assets.microsoftTeamsIcon,
    link: "https://teams.live.com/l/community/FEAn5w7MQEcTVIEBQI",
    external: true,
    cta: "Join Team"
  },
  {
    title: "Learn on the Go",
    desc: "Study anytime, anywhere with our mobile-friendly platform.",
    icon: assets.whatsapplogos,
    link: "https://whatsapp.com/channel/0029VbAqzsdCXC3IWPf3uG1O",
    external: true,
    cta: "Join Channel"
  },
  {
    title: "Registration",
    desc: "Complete your registration to access live projects and exclusive opportunities.",
    icon: assets.registrationIcon,
    link: "https://forms.gle/Qmoio93xjaZsSGHy7",
    external: true,
    cta: "Register Now"
  },
  {
    title: "Apply for Job",
    desc: "Explore open positions and apply for roles that match your skills.",
    icon: assets.Job_apply,
    actions: [
      { label: "Software Developer", type: "external", target: "https://forms.gle/duaAAf3ToFTqCFNL7" },
      { label: "Business Development Associate", type: "external", target: "https://forms.gle/VhKk9GjBqD5jZ3uPA" }
    ],
    cta: "Apply Now"
  },
  {
    title: "Enquiry Form",
    desc: "Have questions? Submit an enquiry and we will get back to you.",
    icon: assets.enquiryIcon,
    link: "https://forms.gle/6uAMoSrHvsa82fx9A",
    external: true,
    cta: "Contact Us"
  },
  {
    title: "Support Query",
    desc: "Ask your questions and get support instantly from our team.",
    icon: assets.supportIcon,
    link: "https://forms.gle/KMPcsShqiW1MCSLdA",
    external: true,
    cta: "Get Help"
  },
];

const cardVariants = {
  offscreen: (i) => ({ y: 50, opacity: 0 }),
  onscreen: (i) => {
    const delay = i * 0.05;
    return {
      y: 0,
      opacity: 1,
      transition: {
        delay,
        type: "spring",
        stiffness: 50,
        damping: 10,
      },
    };
  },
};

// --- Reusable Card Content Component ---
const CardContent = ({ f }) => (
  // Added 'group' here to control hover states for children
  <motion.div 
    className="relative h-full flex flex-col justify-between p-6 z-10 overflow-hidden group bg-white rounded-2xl border border-gray-50 shadow-md hover:shadow-xl transition-shadow duration-300"
    initial="initial"
    whileHover="hover"
  >
    
    {/* --- THE EXPANDING BLOB --- */}
    {/* This sits behind the text (z-0) but above the white bg. Expands on hover. */}
    <motion.div 
      variants={{
        initial: { scale: 2, opacity: 0.1 },
        hover: { scale: 25, opacity: 5 }
      }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full z-0 pointer-events-none"
    ></motion.div>


    {/* --- TEXT CONTENT (Z-10 to stay on top) --- */}
    <div className="flex flex-col items-start text-left z-10 relative">
      <h3 className="text-2xl font-bold text-[#032d60] mb-3 group-hover:text-white transition-colors duration-300">
        {f.title}
      </h3>
      <p className="text-base text-gray-600 leading-relaxed max-w-[85%] group-hover:text-indigo-100 transition-colors duration-300">
        {f.desc}
      </p>
    </div>

    {/* --- BOTTOM SECTION (Z-10) --- */}
    <div className="mt-8 pt-4 flex items-center z-10 relative">
      <span className="text-sm font-semibold text-[#032d60] border-b border-[#032d60]/30 pb-0.5 group-hover:text-white group-hover:border-white transition-all duration-300 flex items-center">
        {f.cta || "Explore More"}
      </span>
    </div>
    
    {/* --- ICON CONTAINER --- */}
    <div className="absolute bottom-5 right-5 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center z-10 group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
       <img src={f.icon} alt={f.title} className="w-7 h-7 object-contain" />
    </div>

  </motion.div>
);

const Features = () => {
  const headingRef = useRef(null);
  const gridRef = useRef(null);
  const headingControls = useAnimation();
  const gridControls = useAnimation();
  const navigate = useNavigate();

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
  const gridInView = useInView(gridRef, { amount: 0.1, once: false });

  useEffect(() => {
    if (headingInView) {
      headingControls.start({ opacity: 1, y: 0, transition: { duration: 0.7 } });
    } else {
      headingControls.set({ opacity: 0, y: -20 });
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
      mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange);
    };
  }, []);

  const openModal = (feature) => {
    setActiveFeature(feature);
    setIsModalOpen(true);
  };

  const cardWrapperClass = "h-[280px] w-full block cursor-pointer";

  const renderCard = (f, idx) => {
    const handleCardClick = () => {
      if (f.pdf) window.open(f.pdf, "_blank");
      else if (f.actions) openModal(f);
    };

    if (f.actions || f.pdf) {
      return (
        <motion.div
          key={f.title}
          custom={idx}
          variants={cardVariants}
          onClick={handleCardClick}
          className={cardWrapperClass}
        >
          <CardContent f={f} />
        </motion.div>
      );
    }

    if (f.external) {
      return (
        <a key={f.title} href={f.link} target="_blank" rel="noopener noreferrer" className="block h-full">
          <motion.div custom={idx} variants={cardVariants} className={cardWrapperClass}>
            <CardContent f={f} />
          </motion.div>
        </a>
      );
    }

    if (f.link) {
      return (
        <Link key={f.title} to={f.link} className="block h-full">
          <motion.div custom={idx} variants={cardVariants} className={cardWrapperClass}>
            <CardContent f={f} />
          </motion.div>
        </Link>
      );
    }
    return <div key={f.title} className={cardWrapperClass}><CardContent f={f} /></div>;
  };

  const renderMobileCard = (f) => {
    const handleCardClick = () => {
      if (f.pdf) window.open(f.pdf, "_blank");
      else if (f.actions) openModal(f);
    };

    if (f.actions || f.pdf) {
      return (
        <div key={f.title} onClick={handleCardClick} className={cardWrapperClass}>
          <CardContent f={f} />
        </div>
      );
    }
    if (f.external) {
      return (
        <a key={f.title} href={f.link} target="_blank" rel="noopener noreferrer" className={cardWrapperClass}>
          <CardContent f={f} />
        </a>
      );
    }
    if (f.link) {
      return <Link key={f.title} to={f.link} className={cardWrapperClass}><CardContent f={f} /></Link>;
    }
    return <div key={f.title} className={cardWrapperClass}><CardContent f={f} /></div>;
  };

  return (
    <section className="w-full bg-[#f8fbfe] py-16 lg:py-24">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
           ref={headingRef}
           animate={headingControls}
           initial={{opacity:0, y:-20}}
           className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#032d60] tracking-tight mb-4">
            Everything you need to grow
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect, learn, and accelerate your career with our comprehensive ecosystem.
          </p>
        </motion.div>

        {/* Desktop Grid */}
        {isDesktop ? (
            <motion.div
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
              initial="offscreen"
              animate={gridControls}
            >
              {features.map(renderCard)}
            </motion.div>
        ) : (
          /* Mobile Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {features.map(renderMobileCard)}
            </div>
        )}
      </div>

      {/* ========================= MODAL ========================= */}
      {isModalOpen && activeFeature && (
        <div className="fixed inset-0 z-50 bg-[#032d60]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
          >
             {/* Decorative top bar */}
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

            <div className="flex flex-col items-center mb-6 mt-2">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                    <img src={activeFeature.icon} alt={activeFeature.title} className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#032d60] text-center">
                {activeFeature.title}
                </h3>
            </div>

            <div className="space-y-3">
              {activeFeature.actions?.map((a, i) => (
                <button
                  key={i}
                  className="w-full py-3.5 px-4 rounded-xl bg-gray-50 text-gray-700 font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-200 flex items-center justify-between group"
                  onClick={() => {
                    if (a.type === "internal") navigate(a.target);
                    if (a.type === "external") window.open(a.target, "_blank");
                    setIsModalOpen(false);
                    setActiveFeature(null);
                  }}
                >
                  {a.label}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>

            <button
              className="mt-6 w-full py-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
              onClick={() => {
                setIsModalOpen(false);
                setActiveFeature(null);
              }}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default Features;