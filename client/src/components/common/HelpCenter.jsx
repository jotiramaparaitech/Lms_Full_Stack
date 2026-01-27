import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Headphones,
  X,
  MessageSquare,
  Phone,
  Mail,
  ArrowLeft,
  Search,
  PenSquare,
  Clock,
} from "lucide-react";
import SupportTicketModal from "./SupportTicketModal";

// --- CONFIGURATION ---
const WHATSAPP_NUMBER = "6364326342";
const GOOGLE_FORM_CALLBACK = "https://forms.gle/gxAc4FvCbK3SQ3YS9";

// --- DATA ---
const FAQS = [
  {
    category: "General & Account",
    items: [
      {
        question: "How do I reset my password?",
        answer:
          "Go to the login page and select 'Forgot Password.' Enter your registered email address to receive a secure password reset link.",
      },
    ],
  },
  {
    category: "Live Projects & Support",
    items: [
      {
        question: "How does the Live Project start?",
        answer:
          "After enrollment, you will receive a Project PDF with complete details of the workflow. You will also be added to a Microsoft Team for project communication.",
      },
      {
        question: "How often will the guidance sessions happen?",
        answer:
          "Guidance sessions are held 2-3 times a week by the Project Coordinator to track progress, review work, and clear doubts.",
      },
      {
        question: "Where can I ask my daily questions or doubts?",
        answer:
          "You can ask your questions in the assigned Microsoft Community. The Project Coordinator will help you there.",
      },
      {
        question: "When will I get my certificate?",
        answer:
          "You will receive your certificate after completing the project and getting approval from the mentor.",
      },
      {
        question: "What will I receive during the Live Project Program?",
        answer: `During the Live Project Program, you will receive:
• Project Completion Certificate
• Letter of Recommendation (LOR) (based on performance)
• Experience Letter
• Offer Letter (subject to eligibility and performance)
• Aparaitech ID Card`,
      },
      {
        question: "Does the company provide software products?",
        answer:
          "Yes. Aparaitech provides access to real-time company-level software products and live project environments, helping students understand how industry projects are developed, managed, and delivered.",
      },
      {
        question: "Which domains are available for Live Projects?",
        answer:
          "We offer Live Projects across 30+ in-demand domains, including: Web Development, Artificial Intelligence, Data Science, Data Analytics, DevOps, and more.",
      },
      {
        question: "Do you provide demo projects?",
        answer: `Yes. We provide demo projects to help students understand the project flow before starting.
Example - Web Development Demo Project:
Project Name: "Student Management System"
Description: A web-based application to manage student records, registrations, and data using the latest technology. This demo helps students understand project structure.`,
      },
      {
        question: "Why should I pay fees to the company?",
        answer:
          "Your fees cover industry-grade training, real-time project exposure, expert guidance, project resources, certification, and career support.",
      },
    ],
  },
];

const HelpCenter = ({ onClose }) => {
  const [view, setView] = useState("HOME"); // HOME | CONTACT_MENU | TICKET_FORM
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWithinWorkingHours, setIsWithinWorkingHours] = useState(true);

  // Check if current time is within working hours (10 AM to 7 PM)
  useEffect(() => {
    const checkWorkingHours = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute; // Convert to minutes for easier comparison
      
      const startTime = 10 * 60; // 10:00 AM in minutes
      const endTime = 19 * 60; // 7:00 PM in minutes
      
      setIsWithinWorkingHours(currentTime >= startTime && currentTime < endTime);
    };

    // Check immediately on mount
    checkWorkingHours();
    
    // Set up interval to check every minute
    const intervalId = setInterval(checkWorkingHours, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const toggleFaq = (id) => {
    setOpenFaqIndex(openFaqIndex === id ? null : id);
  };

  const handleChat = () => {
    if (!isWithinWorkingHours) return;
    
    const message = "Hello! I'd like to know more about Aparaitech Projects.";
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleCallback = () => {
    if (!isWithinWorkingHours) return;
    
    window.open(GOOGLE_FORM_CALLBACK, "_blank");
  };

  // Filter FAQs based on search
  const filteredFAQs = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  if (view === "TICKET_FORM") {
    return <SupportTicketModal onClose={() => setView("HOME")} />;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal Card - Width adjusted to max-w-[500px] */}
      <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl overflow-hidden flex flex-col relative h-[720px] max-h-[90vh] animate-in zoom-in-95 duration-200 font-sans">
        
        {/* === HEADER (Redesigned) === */}
        <div className="bg-slate-900 px-6 pt-6 pb-6 relative shrink-0">
          <div className="flex justify-between items-start">
            
            {/* Title Area */}
            <div className="pr-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {view === "CONTACT_MENU" ? "Get in Touch" : "Help Center"}
              </h2>
              <p className="text-slate-400 text-[14px] mt-1 leading-snug">
                {view === "CONTACT_MENU"
                  ? "Choose a support method below."
                  : "How can we help you today?"}
              </p>
            </div>

            {/* Actions Area (Submit Ticket + Close) */}
            <div className="flex flex-col items-end gap-3">
               <button
                  onClick={onClose}
                  className="text-white/50 hover:text-white transition-colors p-1"
               >
                  <X className="w-6 h-6" />
               </button>

               {/* Only show Ticket button on Home view */}
               {view === "HOME" && (
  <button
    onClick={() => setView("TICKET_FORM")}
    className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 border-0 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl sm:hover:shadow-2xl active:scale-95 overflow-hidden whitespace-nowrap"
  >
    {/* Shine effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    
    <PenSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 group-hover:scale-110 transition-transform" />
    <span className="relative z-10">Submit Ticket</span>
  </button>
)}
            </div>
          </div>
        </div>

        {/* === BODY CONTENT === */}
        <div className="flex-1 overflow-hidden relative bg-[#F4F6F9]">
          
          {/* --- VIEW 1: FAQ LIST --- */}
          <div
            className={`absolute inset-0 overflow-y-auto transition-transform duration-300 ease-in-out ${
              view === "HOME" ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-5 space-y-6">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-gray-400"
                />
              </div>

              {/* FAQ List */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 pl-1">
                  Popular FAQs
                </h3>

                <div className="space-y-3">
                  {filteredFAQs.map((category, catIndex) => (
                    <div key={catIndex} className="space-y-3">
                      {category.items.map((faq, itemIndex) => {
                        const id = `${catIndex}-${itemIndex}`;
                        const isOpen = openFaqIndex === id;

                        return (
                          <div
                            key={itemIndex}
                            className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:border-blue-200 transition-colors"
                          >
                            <button
                              onClick={() => toggleFaq(id)}
                              className="w-full flex items-center justify-between p-4 text-left"
                            >
                              <span className={`text-[15px] font-medium leading-snug pr-4 transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-700'}`}>
                                {faq.question}
                              </span>
                              <ChevronRight
                                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                                  isOpen ? "rotate-90 text-blue-600" : ""
                                }`}
                              />
                            </button>

                            <div
                              className={`transition-all duration-300 ease-in-out ${
                                isOpen
                                  ? "max-h-96 opacity-100 border-t border-gray-50"
                                  : "max-h-0 opacity-0"
                              }`}
                            >
                              <div className="p-4 text-[14px] text-slate-600 leading-relaxed bg-gray-50/30">
                                {faq.answer}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {filteredFAQs.length === 0 && (
                    <div className="text-center py-10">
                       <p className="text-slate-800 font-medium">No results found</p>
                       <p className="text-slate-500 text-sm mt-1">Try a different keyword or contact support.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Spacer for bottom bar */}
            <div className="h-28"></div>
          </div>

          {/* --- VIEW 2: CONTACT OVERLAY --- */}
          <div
            className={`absolute inset-0 bg-gray-50 z-20 overflow-y-auto p-5 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
              view === "CONTACT_MENU" ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <button
              onClick={() => setView("HOME")}
              className="mb-6 flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to FAQs
            </button>

            {/* Working Hours Notice */}
            {!isWithinWorkingHours && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-amber-800">
                    Outside Working Hours
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Live chat & callback support is available from 10 AM to 7 PM.
                    You can still submit a ticket - we'll respond within 24 hours.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <ContactOption
                icon={<Mail className="w-5 h-5 text-blue-600" />}
                title="Create Ticket"
                desc="Expect a response within 1-2 business days"
                onClick={() => setView("TICKET_FORM")}
                disabled={false}
                alwaysActive={true}
              />
              
              <ContactOption
                icon={<MessageSquare className={`w-5 h-5 ${isWithinWorkingHours ? 'text-emerald-600' : 'text-gray-400'}`} />}
                title="WhatsApp Chat"
                desc={isWithinWorkingHours ? "Instant support (10 AM - 7 PM)" : "Available 10 AM - 7 PM"}
                onClick={handleChat}
                disabled={!isWithinWorkingHours}
                alwaysActive={false}
              />
              
              <ContactOption
                icon={<Phone className={`w-5 h-5 ${isWithinWorkingHours ? 'text-violet-600' : 'text-gray-400'}`} />}
                title="Request Callback"
                desc={isWithinWorkingHours ? "One of our specialists will reach out to you shortly." : "Available 10 AM - 7 PM"}
                onClick={handleCallback}
                disabled={!isWithinWorkingHours}
                alwaysActive={false}
              />
            </div>
          </div>
        </div>

        {/* === FOOTER (Sticky) === */}
        <div
          className={`px-6 pb-6 pt-4 bg-white border-t border-gray-100 absolute bottom-0 w-full transition-transform duration-300 z-30 ${
            view === "CONTACT_MENU" ? "translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="flex flex-col items-center">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">
              Still need help?
            </p>
            <button
              onClick={() => setView("CONTACT_MENU")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
            >
              <Headphones className="w-5 h-5" />
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated Helper Component for Contact Options
const ContactOption = ({ icon, title, desc, onClick, disabled, alwaysActive }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled && !alwaysActive}
    className={`w-full p-4 rounded-xl border transition-all flex items-center group text-left ${
      disabled && !alwaysActive
        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
        : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300'
    }`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
      disabled && !alwaysActive ? 'bg-gray-100' : 'bg-gray-50 group-hover:bg-blue-50'
    }`}>
      {icon}
    </div>
    <div className="ml-4 flex-1">
      <h4 className={`font-bold text-[15px] ${
        disabled && !alwaysActive ? 'text-gray-400' : 'text-slate-800'
      }`}>
        {title}
        {disabled && !alwaysActive && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
            <Clock className="w-3 h-3 mr-1" />
            10 AM - 7 PM
          </span>
        )}
      </h4>
      <p className={`text-xs mt-0.5 ${
        disabled && !alwaysActive ? 'text-gray-400' : 'text-slate-500'
      }`}>
        {desc}
      </p>
    </div>
    <ChevronRight className={`w-4 h-4 ${
      disabled && !alwaysActive ? 'text-gray-300' : 'text-gray-300 group-hover:text-blue-500'
    }`} />
  </button>
);

export default HelpCenter;