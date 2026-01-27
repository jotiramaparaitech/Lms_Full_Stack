import React, { useState, useContext, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { useAuth, useUser } from "@clerk/clerk-react";
import { 
  X, 
  Loader2, 
  Send, 
  Ticket, 
  AlertCircle,
  FileText,
  CheckCircle2,
  Sparkles
} from "lucide-react";

const SupportTicketModal = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [animationStage, setAnimationStage] = useState(0); // 0=form, 1=processing, 2=success
  const [progress, setProgress] = useState(0);
  const [shouldBlink, setShouldBlink] = useState(false);
  const modalRef = useRef(null);
  const formRef = useRef(null);
  const successRef = useRef(null);

  const { backendUrl } = useContext(AppContext);
  const { getToken } = useAuth();
  const { user } = useUser();

  // Animated progress effect
  useEffect(() => {
    let interval;
    if (animationStage === 1) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 40);
    }
    return () => clearInterval(interval);
  }, [animationStage]);

  // Start blinking animation after success animation completes
  useEffect(() => {
    if (animationStage === 2) {
      // Wait for the checkmark animation to complete (1s) then start blinking
      const blinkTimer = setTimeout(() => {
        setShouldBlink(true);
        
        // Stop blinking after 5 seconds
        setTimeout(() => {
          setShouldBlink(false);
        }, 5000);
      }, 1000);
      
      return () => clearTimeout(blinkTimer);
    }
  }, [animationStage]);

  const submitTicket = async () => {
    if (!query.trim()) {
      toast.error("Please describe your issue");
      return;
    }

    // Start processing animation
    setAnimationStage(1);
    setShouldBlink(false);

    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/tickets`,
        { query },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        // Simulate processing delay for better UX
        setTimeout(() => {
          setTicketId(data.ticketId || "17873954");
          setAnimationStage(2);
          setIsSubmitted(true);
        }, 1200);
      } else {
        toast.error(data.message || "Failed to submit ticket");
        setAnimationStage(0);
      }
    } catch (error) {
      console.error("Ticket error:", error);
      toast.error(error.response?.data?.message || "Failed to submit. Try again.");
      setAnimationStage(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4" ref={modalRef}>
      <style jsx>{`
        @keyframes wave {
          0% { transform: translateY(0) scaleX(1); opacity: 0.5; }
          50% { transform: translateY(-10px) scaleX(1.05); opacity: 0.8; }
          100% { transform: translateY(0) scaleX(1); opacity: 0.5; }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes checkmark {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }
        .animate-pop-in {
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }
        .animate-checkmark {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: checkmark 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
          animation-delay: 0.3s;
        }
        .animate-blink {
          animation: blink 0.8s ease-in-out infinite;
        }
      `}</style>
      
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-[450px] rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden ring-1 ring-black/5 font-sans" 
           style={{ height: animationStage === 1 ? '300px' : 'auto' }}>
        
        {animationStage === 0 && (
          <>
            {/* === FORM HEADER === */}
            <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-start">
              <div className="flex gap-4">
                {/* REMOVED FLOATING ANIMATION FROM TICKET ICON */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Submit a Ticket</h2>
                  <p className="text-slate-500 text-sm mt-0.5">We usually respond within 24 hours.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-transform hover:scale-110">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* === FORM BODY === */}
            <div className="p-6 bg-gray-50/50" ref={formRef}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
                  Issue Description
                  <span className={`text-xs font-medium transition-all ${query.length > 400 ? 'text-red-500' : 'text-slate-400'}`}>
                    {query.length}/500
                  </span>
                </label>
                <div className="relative group">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Hi, I'm facing an issue with..."
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 min-h-[160px] text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-sm hover:shadow-md"
                    maxLength={500}
                    autoFocus
                  />
                  {query.length > 0 && (
                    <div className="absolute bottom-2 right-2">
                      <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-3 flex gap-3 items-start transform transition-transform hover:scale-[1.02]">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Tip:</strong> If this is regarding a Live Project, please specify the error message.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <button
                onClick={submitTicket}
                disabled={loading || !query.trim()}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  !query.trim() 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98]"
                }`}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {loading ? "Processing..." : "Submit Ticket"}
              </button>
            </div>
          </>
        )}

        {animationStage === 1 && (
          /* === PROCESSING ANIMATION === */
          <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Loading Spinner */}
            <div className="relative z-10 mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-blue-100 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"></div>
                <Loader2 className="w-10 h-10 text-blue-500 absolute animate-spin" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 bg-gray-100 rounded-full h-2 mb-6 overflow-hidden relative z-10">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>

            {/* Animated Text */}
            <div className="text-center space-y-2 relative z-10">
              <h3 className="text-xl font-bold text-slate-800">Processing Your Request</h3>
              <p className="text-slate-500 text-sm animate-pulse">
                {progress < 30 && "Validating your query..."}
                {progress >= 30 && progress < 60 && "Creating support ticket..."}
                {progress >= 60 && progress < 90 && "Generating ticket ID..."}
                {progress >= 90 && "Finalizing..."}
              </p>
            </div>
          </div>
        )}

        {animationStage === 2 && (
          /* === SUCCESS STATE === */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" ref={successRef}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Ticket Confirmation
              </h2>
              <button onClick={onClose} className="text-white/80 hover:text-white transition-transform hover:scale-110">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col items-center text-center">
              {/* Animated Checkmark with Blinking Effect */}
              <div className="relative mb-6">
                <div className={`w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200 ${
                  shouldBlink ? 'animate-blink' : 'animate-pop-in'
                }`}>
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
                {/* Ripple Effect */}
                <div className="absolute inset-0 w-20 h-20 border-2 border-green-300 rounded-full animate-ping opacity-20"></div>
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-1 animate-slide-up">Your Support ticket is created</h3>
              <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <p className="text-slate-500 font-medium text-lg">#{ticketId}</p>
              </div>

              <hr className="w-full border-gray-100 mb-6" />

              <div className="space-y-4 px-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <p className="text-slate-600 leading-relaxed">
                  We are currently reviewing your issue. Please expect a status update within <span className="font-bold text-slate-800">4-8 business hours.</span>
                </p>
                <p className="text-slate-600">
                  You can view the status of your ticket in the <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Support</span> section
                </p>
              </div>

              {/* Email Box */}
              <div className="mt-8 w-full bg-slate-50 border border-slate-100 rounded-xl p-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <p className="text-slate-500 text-sm">
                  A confirmation has been mailed to
                </p>
                <p className="text-slate-800 font-medium break-all underline decoration-slate-300 underline-offset-4">
                   {user?.primaryEmailAddress?.emailAddress || "your email"}
                </p>
              </div>

              {/* Done Button */}
              <button
                onClick={onClose}
                className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 animate-slide-up" 
                style={{ animationDelay: '0.4s' }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketModal;