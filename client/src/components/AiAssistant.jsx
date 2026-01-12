import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import aiImage from "../assets/ai.png"; 

// --- 1. CONFIGURATION: Centralized Command List ---
const COMMANDS = [
  // --- EXTERNAL SOCIAL MEDIA ---
  {
    keywords: ["linkedin"],
    type: "external",
    url: "https://www.linkedin.com/company/aparaitech",
    message: "Opening LinkedIn."
  },
  {
    keywords: ["twitter", " x "], 
    type: "external",
    url: "https://x.com/Aparaitech/with_replies",
    message: "Opening X Twitter."
  },
  {
    keywords: ["instagram", "insta"],
    type: "external",
    url: "https://www.instagram.com/aparaitech_global/",
    message: "Opening Instagram."
  },
  {
    keywords: ["youtube"],
    type: "external",
    url: "https://www.youtube.com/@Aparaitech",
    message: "Opening YouTube."
  },
  {
    keywords: ["facebook"],
    type: "external",
    url: "https://www.facebook.com/yourpage",
    message: "Opening Facebook."
  },

  // --- INTERNAL PAGES ---
  {
    keywords: ["project", "library"], 
    type: "navigate",
    path: "/course-list",
    message: "Opening Projects library."
  },
  {
    keywords: ["dashboard", "enrollment"],
    type: "navigate",
    path: "/my-enrollments",
    message: "Opening Dashboard."
  },
  {
    keywords: ["about"],
    type: "navigate",
    path: "/about",
    message: "Opening About page."
  },
  {
    keywords: ["connect", "social media", "contact us"],
    type: "navigate",
    path: "/connect",
    message: "Opening Connect page."
  },
  {
    keywords: ["contact"], 
    type: "navigate",
    path: "/contact",
    message: "Opening Contact page."
  },

  // --- SCROLL SECTIONS ---
  {
    keywords: ["testimonial", "review"],
    type: "scroll",
    id: "testimonials",
    label: "testimonials",
    message: "Here are the testimonials."
  },
  {
    keywords: ["feature", "service"],
    type: "scroll",
    id: "features",
    label: "features",
    message: "Here are our features."
  },
  {
    keywords: ["company", "companies", "partner"],
    type: "scroll",
    id: "companies",
    label: "companies",
    message: "Here are our partners."
  },
  {
    keywords: ["footer", "bottom"],
    type: "scroll",
    id: "contact-section",
    label: "contact area",
    message: "Taking you to the bottom."
  }
];

const AiAssistant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeAi, setActiveAi] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  // Refs
  const audioCtxRef = useRef(null);
  const recognitionRef = useRef(null);

  // --- AUDIO SETUP ---
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playActivationSound = () => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) { console.error(e); }
  };

  const speak = (message, onEndCallback = null) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Female"));
    if (preferredVoice) utterance.voice = preferredVoice;
    if (onEndCallback) utterance.onend = onEndCallback;
    window.speechSynthesis.speak(utterance);
  };

  const scrollToSection = (sectionId, sectionName) => {
    const performScroll = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        speak(sectionName ? `Opening ${sectionName}.` : "Here it is.");
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        speak(`I couldn't find the ${sectionName || "requested"} section.`);
      }
    };

    if (location.pathname !== "/") {
      speak(`Navigating to home to show ${sectionName}.`);
      navigate("/");
      setTimeout(performScroll, 500);
    } else {
      performScroll();
    }
  };

  // --- EXECUTE COMMAND ---
  const executeCommand = (transcript) => {
    
    // 1. SEARCH
    if (transcript.includes("search for") || transcript.includes("find")) {
        const triggerWord = transcript.includes("search for") ? "search for" : "find";
        let query = transcript.split(triggerWord)[1];
        if (query) {
            query = query.replace("projects", "").replace("project", "").replace(/[?.]/g, "").trim();
        }
        if (query && query.length > 0) {
          speak(`Searching for ${query}`);
          navigate(`/course-list/${query}`);
        } else {
          speak("Please say a topic to search.");
        }
        return; 
    }

    // 2. HOME
    if (transcript.includes("home") || transcript.includes("top")) {
      speak("Going to home page.");
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => window.scrollTo(0, 0), 100);
      }
      return;
    }

    // 3. ARRAY LOGIC (Socials, Pages, Sections)
    const matchedCommand = COMMANDS.find(cmd => 
        cmd.keywords.some(keyword => transcript.includes(keyword))
    );

    if (matchedCommand) {
        speak(matchedCommand.message);
        
        if (matchedCommand.type === "external") {
            // ✅ FIX: Try new tab first, fallback to same tab if blocked
            const newWindow = window.open(matchedCommand.url, "_blank");
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                console.log("Pop-up blocked. Opening in current tab.");
                window.location.href = matchedCommand.url;
            }
        } 
        else if (matchedCommand.type === "navigate") {
            navigate(matchedCommand.path);
        } 
        else if (matchedCommand.type === "scroll") {
            scrollToSection(matchedCommand.id, matchedCommand.label);
        }
        return;
    }

    // 4. FALLBACK
    if (transcript.includes("who are you") || transcript.includes("intro")) {
      speak("I am the Aparaitech Assistant. We focus on AI solutions.");
    } else {
      speak("I didn't quite catch that.");
    }
  };

  // --- LISTENING ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice assistant not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => { setActiveAi(true); playActivationSound(); };
    recognition.onend = () => setActiveAi(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim().toLowerCase();
      console.log("Voice Command:", transcript);
      executeCommand(transcript);
    };

    recognition.start();
  };

  const handleInteraction = () => {
    if (activeAi) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setActiveAi(false);
      return;
    }
    if (!hasGreeted) {
      setHasGreeted(true);
      speak("Welcome to Aparaitech. We Focus on AI Solutions. How can I help you?", () => startListening());
    } else {
      startListening();
    }
  };

  useEffect(() => { window.speechSynthesis.getVoices(); }, []);

  return (
    <div 
      className="fixed bottom-6 left-6 z-50 group cursor-pointer"
      onClick={handleInteraction}
      title="Tap to Speak"
    >
      <div className="relative transition-all duration-300">
        {activeAi && (
          <>
            <span className="absolute -inset-1 rounded-full bg-blue-500 opacity-75 animate-ping"></span>
            <span className="absolute -inset-2 rounded-full bg-blue-400 opacity-50 animate-pulse"></span>
          </>
        )}
        <div className={`relative flex items-center justify-center h-16 w-16 bg-white rounded-full shadow-2xl border-2 transition-transform duration-300 ${activeAi ? "scale-110 border-blue-500" : "hover:scale-105 border-gray-200"}`}>
            <img src={aiImage} alt="AI" className={`w-9 h-9 object-contain transition-opacity duration-300 ${activeAi ? "opacity-100" : "opacity-80"}`} />
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;