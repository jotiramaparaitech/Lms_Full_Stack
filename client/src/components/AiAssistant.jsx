import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import aiImage from "../assets/ai.png"; // Ensure this image exists

const AiAssistant = () => {
  const navigate = useNavigate();
  const [activeAi, setActiveAi] = useState(false);

  // 🔊 A simple "Beep" sound encoded in Base64 (No need for external mp3 file)
  const playActivationSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime); // 500Hz beep
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1); // Stop after 100ms
  };

  const speak = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  };

  const handleStartListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice assistant not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setActiveAi(true);
      playActivationSound();
    };

    recognition.onend = () => {
      setActiveAi(false);
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim().toLowerCase();
      console.log("Voice Command:", transcript);

      // --- COMMAND LOGIC ---
      if (transcript.startsWith("search for") || transcript.startsWith("find")) {
        const query = transcript.replace("search for", "").replace("find", "").trim();
        if (query.length > 0) {
          speak(`Searching for ${query}`);
          navigate(`/course-list/${query}`);
        } else {
          speak("Please say a topic to search.");
        }
      } 
      else if (transcript.includes("home")) {
        speak("Going home");
        navigate("/");
      } 
      else if (transcript.includes("projects") || transcript.includes("library")) {
        speak("Opening projects");
        navigate("/course-list");
      } 
      else if (transcript.includes("my courses") || transcript.includes("dashboard")) {
        speak("Opening dashboard");
        navigate("/my-enrollments");
      } 
      else if (transcript.includes("educator")) {
        speak("Switching to educator mode");
        navigate("/educator");
      } 
      else if (transcript.includes("about")) {
        speak("Opening about page");
        navigate("/about");
      } 
      else if (transcript.includes("contact")) {
        speak("Opening contact page");
        navigate("/contact");
      } 
      else {
        speak("I didn't quite catch that.");
      }
    };

    recognition.start();
  };

  return (
    // ❌ Removed 'fixed bottom-...' classes because App.jsx handles positioning now
    <div 
      className="relative z-50 group cursor-pointer"
      onClick={handleStartListening}
      title="Tap to Speak"
    >
      <div className="relative transition-all duration-300">
        {/* Pulse Animation */}
        {activeAi && (
          <span className="absolute -inset-1 rounded-full bg-blue-500 opacity-75 animate-ping"></span>
        )}
        
        {/* Icon Container */}
        <div className={`relative flex items-center justify-center h-14 w-14 bg-white rounded-full shadow-lg border border-gray-200 transition-transform duration-300 ${activeAi ? "scale-110 border-blue-500" : "hover:scale-105"}`}>
            <img
            src={aiImage}
            alt="AI"
            className="w-8 h-8 object-contain"
            />
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;