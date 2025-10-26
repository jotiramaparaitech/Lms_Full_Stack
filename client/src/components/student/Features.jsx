import React, { useRef, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { motion, useAnimation, useInView } from "framer-motion";

const features = [
  {
    title: "Experienced Tutors",
    desc: "Learn from mentors who are experts in their own fields.",
    icon: assets.lesson_icon,
  },
  {
    title: "Interactive Live Classes",
    desc: "Interact in live classes with renowned, expert faculty.",
    icon: assets.play_icon,
  },
  {
    title: "Pre-recorded Lectures",
    desc: "Learn with simple, high-quality videos for better clarity.",
    icon: assets.course_4_thumbnail,
  },
  {
    title: "One-on-One Mentorship",
    desc: "Get 24x7 support with mentors and your peer group.",
    icon: assets.profile_img,
  },
  {
    title: "Globalized Certificates",
    desc: "Earn professional certificates to showcase your skills.",
    icon: assets.logo,
  },
  {
    title: "Live Doubt Solving",
    desc: "Connect with mentors directly and clarify doubts instantly.",
    icon: assets.appointments_icon,
  },
  {
    title: "Alerts & Notifications",
    desc: "Stay updated with real-time alerts and course updates.",
    icon: assets.blue_tick_icon,
  },
  {
    title: "Learn on the Go",
    desc: "Study anytime, anywhere with our mobile-friendly platform.",
    icon: assets.whatsapplogos,
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

  // ✅ Title animation re-triggers every time
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

  // ✅ Grid animation re-triggers every time
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

  return (
    <section className="w-full bg-[#eaf4fb] py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8"
              initial="offscreen"
              animate={gridControls}
              viewport={{ once: false, amount: 0.2 }}
              variants={{ onscreen: {}, offscreen: {} }}
              style={{ perspective: 1200 }}
            >
              {features.map((f, idx) => (
                <motion.div
                  key={f.title}
                  custom={idx}
                  variants={cardVariants}
                  className="group relative bg-white rounded-2xl p-6 md:p-8 lg:p-10 transform-gpu transition-all duration-400 ease-out cursor-pointer shadow-md hover:shadow-2xl md:hover:-translate-y-2"
                  style={{
                    willChange: "transform, box-shadow",
                    transformStyle: "preserve-3d",
                    transformOrigin: "center center",
                  }}
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
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-[#1f3a8a] mb-8 sm:mb-12">
              Our Features
            </h2>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8"
              style={{ perspective: 1200 }}
            >
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group relative bg-white rounded-2xl p-6 md:p-8 lg:p-10 transform-gpu transition-all duration-400 ease-out cursor-pointer shadow-md"
                  style={{
                    willChange: "transform, box-shadow",
                    transformStyle: "preserve-3d",
                    transformOrigin: "center center",
                  }}
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
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Features;
