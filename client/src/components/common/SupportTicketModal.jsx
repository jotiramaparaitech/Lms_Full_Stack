import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { useAuth } from "@clerk/clerk-react";
import { 
  X, 
  Loader2, 
  Send, 
  Ticket, 
  AlertCircle,
  FileText
} from "lucide-react";

const SupportTicketModal = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const { backendUrl } = useContext(AppContext);
  const { getToken } = useAuth();

  const submitTicket = async () => {
    if (!query.trim()) {
      toast.error("Please describe your issue");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/tickets`,
        { query },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Ticket submitted successfully!");
        setQuery("");
        onClose();
      } else {
        toast.error(data.message || "Failed to submit ticket");
      }
    } catch (error) {
      console.error("Ticket error:", error);
      toast.error(error.response?.data?.message || "Failed to submit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop matching HelpCenter
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-[500px] rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden ring-1 ring-black/5 font-sans">
        
        {/* === HEADER === */}
        <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Submit a Ticket
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                We usually respond within 24 hours.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* === BODY === */}
        <div className="p-6 bg-gray-50/50 min-h-[300px]">
          
          {/* Label & Context */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
              Issue Description
              <span className="text-xs font-normal text-slate-400">
                {query.length} chars
              </span>
            </label>
            
            {/* Text Area */}
            <div className="relative group">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hi, I'm facing an issue with..."
                className="w-full bg-white border border-gray-200 rounded-xl p-4 min-h-[160px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none text-[15px] leading-relaxed shadow-sm group-hover:border-gray-300"
                autoFocus
              />
              <div className="absolute bottom-3 right-3 text-slate-300 pointer-events-none">
                <FileText className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Helper Note */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Tip:</strong>If this is regarding a Live Project, please specify the error message you are encountering.
            </p>
          </div>
        </div>

        {/* === FOOTER === */}
        <div className="p-4 bg-white border-t border-gray-100">
          <button
            onClick={submitTicket}
            disabled={loading}
            className={`
              w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg
              ${loading 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200 active:scale-[0.99]"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Ticket
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SupportTicketModal;