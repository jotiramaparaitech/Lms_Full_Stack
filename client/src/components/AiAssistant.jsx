import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "@clerk/clerk-react";
import aiImage from "../assets/ai.png";
import clickSound from "../assets/ai-click.mp3";
import HelpCenter from "./common/HelpCenter";

/* ---------------- COMMAND CONFIG ---------------- */

const COMMANDS = [
  { keywords: ["linkedin"], type: "external", url: "https://www.linkedin.com/company/aparaitech", label: "LinkedIn" },
  { keywords: ["twitter", "x"], type: "external", url: "https://x.com/Aparaitech/with_replies", label: "X Twitter" },
  { keywords: ["instagram", "insta"], type: "external", url: "https://www.instagram.com/aparaitech_global/", label: "Instagram" },
  { keywords: ["youtube"], type: "external", url: "https://www.youtube.com/@Aparaitech", label: "YouTube" },
  { keywords: ["facebook"], type: "external", url: "https://www.facebook.com/profile.php?id=61586032508393", label: "Facebook" },

  { keywords: ["project", "library"], type: "navigate", path: "/course-list", label: "projects library" },
  { keywords: ["dashboard"], type: "navigate", path: "/student/dashboard", label: "student dashboard" },
  { keywords: ["about"], type: "navigate", path: "/about", label: "about page" },
  { keywords: ["connect", "social media"], type: "navigate", path: "/connect", label: "connect page" },
  { keywords: ["contact"], type: "navigate", path: "/contact", label: "contact page" },

  { keywords: ["testimonial", "review"], type: "scroll", id: "testimonials", label: "testimonials" },
  {
    keywords: ["feature", "service", "certificate", "learn", "study", "job", "apply"],
    type: "scroll",
    id: "features",
    label: "features and services",
  },
  { keywords: ["company", "companies", "partner"], type: "scroll", id: "companies", label: "partner companies" },

  { keywords: ["help", "support"], type: "modal", label: "help center" },
  { keywords: ["footer", "bottom"], type: "scroll", id: "contact-section", label: "bottom section" },
];

/* ---------------- COMPONENT ---------------- */

const AiAssistant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn } = useUser();

  const [activeAi, setActiveAi] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  const recognitionRef = useRef(null);
  const keepListeningRef = useRef(false);
  const clickAudioRef = useRef(null);

  /* ---------------- PRELOAD CLICK SOUND ---------------- */

  useEffect(() => {
    clickAudioRef.current = new Audio(clickSound);
    clickAudioRef.current.volume = 0.5;
    clickAudioRef.current.load(); // ✅ preload
  }, []);

  const playActivationSound = () => {
    try {
      if (clickAudioRef.current) {
        clickAudioRef.current.currentTime = 0;
        clickAudioRef.current.play();
      }
    } catch {}
  };

  /* ---------------- SPEAK ---------------- */

  const speak = (message, onEnd) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(message);
    utter.lang = "en-US";
    utter.rate = 1;
    if (onEnd) utter.onend = onEnd;
    window.speechSynthesis.speak(utter);
  };

  /* ---------------- SCROLL ---------------- */

  const scrollToSection = (id, label) => {
    const doScroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else speak(`I could not find the ${label}.`);
    };

    speak(`Scrolling to ${label}.`);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(doScroll, 500);
    } else {
      doScroll();
    }
  };

  /* ---------------- COMMAND EXECUTION ---------------- */

  const openHelpCenter = () => {
    if (!isSignedIn) {
      toast.info("Please login to access support");
      return;
    }
    setShowHelpCenter(true);
  };

  const executeCommand = (transcript) => {
    if (transcript.includes("home")) {
      speak("Opening home page.");
      navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (transcript.includes("stop listening")) {
      keepListeningRef.current = false;
      recognitionRef.current?.stop();
      speak("Okay, stopping the assistant.");
      return;
    }

    const cmd = COMMANDS.find((c) =>
      c.keywords.some((k) => transcript.includes(k))
    );

    if (cmd) {
      if (cmd.type === "external") {
        speak(`Opening ${cmd.label} now.`);
        window.location.href = cmd.url;
      }
      if (cmd.type === "navigate") {
        speak(`Navigating to the ${cmd.label}.`);
        navigate(cmd.path);
      }
      if (cmd.type === "modal") {
        speak(`Opening the ${cmd.label}.`);
        openHelpCenter();
      }
      if (cmd.type === "scroll") {
        scrollToSection(cmd.id, cmd.label);
      }
      return;
    }

    speak("Sorry, I did not understand that.");
  };

  /* ---------------- LISTENING ---------------- */

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice assistant not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setActiveAi(true);

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.toLowerCase().trim();
      executeCommand(transcript);
    };

    recognition.onend = () => {
      if (keepListeningRef.current) {
        setTimeout(() => recognition.start(), 300);
      } else {
        setActiveAi(false);
      }
    };

    recognition.onerror = () => setActiveAi(false);

    recognition.start();
  };

  /* ---------------- CLICK ---------------- */

  const handleInteraction = () => {
    if (activeAi) {
      keepListeningRef.current = false;
      recognitionRef.current?.stop();
      setActiveAi(false);
      speak("Assistant stopped.");
      return;
    }

    playActivationSound();
    keepListeningRef.current = true;

    if (!hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => {
        speak(
          "Hello! Welcome to Aparaitech Software Solution. I am your AI assistant. How can I help you?",
          startListening
        );
      }, 400);
    } else {
      setTimeout(startListening, 300);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <div
        className="fixed bottom-4 left-4 z-50 cursor-pointer"
        onClick={handleInteraction}
      >
        <div
          className={`h-16 w-16 flex items-center justify-center rounded-full bg-white border-2 shadow-xl ${
            activeAi ? "border-blue-500 scale-110" : "border-gray-400"
          }`}
        >
          <img src={aiImage} alt="AI" className="w-9 h-9" />
        </div>
      </div>

      {showHelpCenter && (
        <HelpCenter onClose={() => setShowHelpCenter(false)} />
      )}
    </>
  );
};

export default AiAssistant;
