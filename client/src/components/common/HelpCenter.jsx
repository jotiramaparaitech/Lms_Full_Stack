import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Headphones,
  X,
  MessageSquare,
  Phone,
  Mail,
  ArrowLeft,
  FileText,
  MonitorPlay,
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
        question: "How do I reset my LMS password?",
        answer:
          "Go to the login page and click on 'Forgot Password'. Enter your registered email to receive a reset link.",
      },
    ],
  },
  {
    category: "Live Projects & Support",
    items: [
      {
        question: "How does the Live Project start?",
        answer:
          "Upon enrollment, you will receive a Project PDF with all the details. You will also be added to a dedicated WhatsApp group with other participants.",
      },
      {
        question: "How often are the mentorship meetings?",
        answer:
          "We conduct live meetings 2-3 times a week. These sessions are for tracking progress, solving doubts, and reviewing your code.",
      },
      {
        question: "Where can I ask day-to-day doubts?",
        answer:
          "Please post your queries in the assigned WhatsApp group. Mentors and peers are active there to help you immediately.",
      },
      {
        question: "When do I get my certificate?",
        answer:
          "Once you complete the project and it is approved by the mentor during the final review, your certificate will be issued to you.",
      },
    ],
  },
];

const HelpCenter = ({ onClose }) => {
  const [view, setView] = useState("HOME"); // HOME | CONTACT_MENU | TICKET_FORM
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Toggle unique IDs: "categoryIndex-itemIndex"
  const toggleFaq = (id) => {
    setOpenFaqIndex(openFaqIndex === id ? null : id);
  };

  const handleChat = () => {
    const message = "Hello! I’d like to know more about Aparaitech Projects.";
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleCallback = () => {
    window.open(GOOGLE_FORM_CALLBACK, "_blank");
  };

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

      {/* Main Modal Card */}
      <div className="bg-white w-full max-w-[500px] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative h-[700px] max-h-[90vh] animate-in zoom-in-95 duration-200 font-sans ring-1 ring-black/5">
        {/* === HEADER === */}
        <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-100 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {view === "CONTACT_MENU" ? "Get in Touch" : "Help Center"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-slate-500 text-[15px]">
            {view === "CONTACT_MENU"
              ? "We are here to help. Choose a method below."
              : "Find answers instantly or contact our team."}
          </p>

          {/* Back Button for overlay view */}
          {view === "CONTACT_MENU" && (
            <button
              onClick={() => setView("HOME")}
              className="absolute top-6 left-[-10px] hidden" // Hidden visually, using logic below
            >
              {/* Logic handled by state, customized back arrow not needed in this header style */}
            </button>
          )}
        </div>

        {/* === BODY CONTENT === */}
        <div className="flex-1 overflow-hidden relative bg-gray-50/50">
          {/* --- VIEW 1: FAQ LIST --- */}
          <div
            className={`absolute inset-0 overflow-y-auto p-6 transition-transform duration-300 ease-in-out ${
              view === "HOME" ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="space-y-6">
              {FAQS.map((category, catIndex) => (
                <div key={catIndex}>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    {catIndex === 0 ? (
                      <FileText className="w-3 h-3" />
                    ) : (
                      <MonitorPlay className="w-3 h-3" />
                    )}
                    {category.category}
                  </h3>
                  <div className="space-y-2">
                    {category.items.map((faq, itemIndex) => {
                      const id = `${catIndex}-${itemIndex}`;
                      const isOpen = openFaqIndex === id;

                      return (
                        <div
                          key={itemIndex}
                          className={`bg-white border rounded-xl transition-all duration-200 ${
                            isOpen
                              ? "border-blue-200 shadow-md ring-1 ring-blue-50"
                              : "border-gray-200 shadow-sm hover:border-blue-300"
                          }`}
                        >
                          <button
                            onClick={() => toggleFaq(id)}
                            className="w-full flex items-start justify-between p-4 text-left"
                          >
                            <span
                              className={`text-[15px] font-medium leading-tight ${
                                isOpen ? "text-blue-700" : "text-slate-700"
                              }`}
                            >
                              {faq.question}
                            </span>
                            <span
                              className={`ml-3 mt-0.5 transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            >
                              <ChevronDown
                                className={`w-5 h-5 ${
                                  isOpen ? "text-blue-500" : "text-gray-300"
                                }`}
                              />
                            </span>
                          </button>

                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isOpen
                                ? "max-h-40 opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="px-4 pb-4 pt-0 text-[14px] text-slate-500 leading-relaxed">
                              {faq.answer}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            {/* Spacer for bottom bar */}
            <div className="h-24"></div>
          </div>

          {/* --- VIEW 2: CONTACT OVERLAY --- */}
          <div
            className={`absolute inset-0 bg-white z-20 overflow-y-auto p-6 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
              view === "CONTACT_MENU" ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <button
              onClick={() => setView("HOME")}
              className="mb-6 flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to FAQs
            </button>

            <div className="space-y-3">
              <ContactOption
                icon={<Mail className="w-6 h-6 text-white" />}
                color="bg-blue-500"
                title="Create Ticket"
                desc="Resolution in 24-48 hours"
                onClick={() => setView("TICKET_FORM")}
              />
              <ContactOption
                icon={<MessageSquare className="w-6 h-6 text-white" />}
                color="bg-emerald-500"
                title="WhatsApp Chat"
                desc="Instant support (10 AM - 7 PM)"
                onClick={handleChat}
              />
              <ContactOption
                icon={<Phone className="w-6 h-6 text-white" />}
                color="bg-violet-500"
                title="Request Callback"
                desc="We will call you within 2 hours"
                onClick={handleCallback}
              />
            </div>

            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                Experiencing urgent technical issues with a live project
                submission?
                <br /> Email us directly at{" "}
                <span className="text-slate-600 font-medium">
                  support@aparaitech.org
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* === FOOTER (Sticky) === */}
        <div
          className={`p-4 bg-white border-t border-gray-100 absolute bottom-0 w-full transition-transform duration-300 ${
            view === "CONTACT_MENU" ? "translate-y-full" : "translate-y-0"
          }`}
        >
          <button
            onClick={() => setView("CONTACT_MENU")}
            className="group w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 rounded-xl flex items-center justify-between px-6 transition-all shadow-lg shadow-slate-200 active:scale-[0.99]"
          >
            <span className="flex items-center gap-3">
              <Headphones className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
              Contact Support
            </span>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Contact Options
const ContactOption = ({ icon, color, title, desc, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex items-center group text-left"
  >
    <div
      className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
    >
      {icon}
    </div>
    <div className="ml-4 flex-1">
      <h4 className="font-bold text-slate-800 text-[16px]">{title}</h4>
      <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
    </div>
    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
    </div>
  </button>
);

export default HelpCenter;
