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
  const audioUnlockedRef = useRef(false);
  const voiceRef = useRef(null);

  /* ---------------- PRELOAD SOUND ---------------- */

  useEffect(() => {
    clickAudioRef.current = new Audio(clickSound);
    clickAudioRef.current.preload = "auto";
    clickAudioRef.current.volume = 0.5;
    clickAudioRef.current.load();
  }, []);

  useEffect(() => {
    const pickVoice = () => {
      const voices = window.speechSynthesis?.getVoices?.() || [];
      if (!voices.length) return;

      const preferredNames = [
        "Google UK English Male",
        "Google US English",
        "Microsoft David",
        "Microsoft Mark",
        "Daniel",
        "Alex",
        "Tom",
      ];

      const maleKeywords = ["male", "man", "david", "daniel", "alex", "tom", "mark"];
      const femaleKeywords = ["female", "woman", "zira", "samantha", "karen", "moira", "susan", "victoria"];

      const byName =
        preferredNames
          .map((name) => voices.find((v) => v.name === name))
          .find(Boolean) || null;

      const byKeyword =
        voices.find((v) =>
          maleKeywords.some((k) => v.name?.toLowerCase().includes(k))
        ) || null;

      const enUsMale =
        voices.find(
          (v) =>
            v.lang === "en-US" &&
            !femaleKeywords.some((k) => v.name?.toLowerCase().includes(k))
        ) || null;

      const enAnyMale =
        voices.find(
          (v) =>
            v.lang?.startsWith("en") &&
            !femaleKeywords.some((k) => v.name?.toLowerCase().includes(k))
        ) || null;

      let selected = byName || byKeyword || enUsMale || enAnyMale || null;

      if (!selected) {
        selected =
          voices.find((v) => v.lang === "en-US") ||
          voices.find((v) => v.lang?.startsWith("en")) ||
          null;
      }

      voiceRef.current = selected;
    };

    pickVoice();
    window.speechSynthesis?.addEventListener?.("voiceschanged", pickVoice);
    return () => {
      window.speechSynthesis?.removeEventListener?.("voiceschanged", pickVoice);
    };
  }, []);

  /* ---------------- AUDIO UNLOCK (CRITICAL FIX) ---------------- */

  const unlockAudio = () => {
    if (audioUnlockedRef.current) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const audio = clickAudioRef.current;
        if (!audio) return resolve();
        audio.muted = true;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.muted = false;
              audioUnlockedRef.current = true;
              resolve();
            })
            .catch(() => resolve());
        } else {
          resolve();
        }
      } catch {
        resolve();
      }
    });
  };

  const playActivationSound = () => {
    const audio = clickAudioRef.current;
    if (!audio) return Promise.resolve();

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        audio.removeEventListener("canplaythrough", onReady);
        audio.removeEventListener("ended", finish);
        resolve();
      };

      const onReady = () => {
        audio.removeEventListener("canplaythrough", onReady);
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch(finish);
        }
      };

      audio.currentTime = 0;
      audio.addEventListener("ended", finish);

      if (audio.readyState < 3) {
        audio.addEventListener("canplaythrough", onReady);
      } else {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.catch(finish);
        }
      }

      setTimeout(finish, 1200);
    });
  };

  /* ---------------- SPEAK ---------------- */

  const speak = (message, onEnd) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(message);
    utter.lang = "en-US";
    utter.rate = 1;
    if (voiceRef.current) {
      utter.voice = voiceRef.current;
    }
    if (onEnd) utter.onend = onEnd;
    window.speechSynthesis.speak(utter);
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

    if (!cmd) {
      speak("Sorry, I did not understand that.");
      return;
    }

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
      const el = document.getElementById(cmd.id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* ---------------- LISTENING ---------------- */

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!window.isSecureContext) {
      toast.error("Voice assistant requires HTTPS to access the microphone.");
      return;
    }

    if (!SpeechRecognition) {
      toast.error("Voice assistant works only in Chrome or Edge.");
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

    recognition.start();
  };

  /* ---------------- CLICK ---------------- */

  const ensureMicPermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      toast.error("Microphone permission denied.");
      return false;
    }
  };

  const handleInteraction = async () => {
    await unlockAudio(); // 🔥 THIS LINE FIXES ALL DEVICES

    if (activeAi) {
      keepListeningRef.current = false;
      recognitionRef.current?.stop();
      setActiveAi(false);
      speak("Assistant stopped.");
      return;
    }

    await playActivationSound();
    keepListeningRef.current = true;

    const hasMic = await ensureMicPermission();
    if (!hasMic) {
      keepListeningRef.current = false;
      return;
    }

    if (!hasGreeted) {
      setHasGreeted(true);
      speak(
        "Hello! Welcome to Aparaitech Software Solution. I am your AI assistant. How can I help you?",
        startListening
      );
    } else {
      startListening();
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
