import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  MessageSquare,
  Mail,
  Trash2,
  X,
  Send,
  AlertCircle,
  WifiOff,
  Inbox
} from "lucide-react";

const SupportTickets = () => {
  const { backendUrl, isEducator, getToken } = useContext(AppContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "open", "solved"

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");

  // ✅ Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setError(null);
      if (tickets.length === 0) {
        fetchTickets();
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setError("No internet connection. Please check your network.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [tickets]);

  // ✅ Simulate loading progress (Smoother increments)
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 5; // Slower increment (5% instead of 10%)
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [loading]);

  // Fetch Tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get(
        `${backendUrl}/api/tickets/educator`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setTickets(data.tickets);
        setLoadingProgress(100);
      } else {
        setError(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      setError("Failed to load tickets");
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  // Delete Ticket
  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to permanently delete this ticket?")) return;

    try {
      const token = await getToken();
      const { data } = await axios.delete(`${backendUrl}/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success("Ticket deleted successfully");
        setTickets((prev) => prev.filter((t) => t._id !== ticketId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error deleting ticket");
    }
  };

  // Open Modal
  const openSolveModal = (ticket) => {
    setSelectedTicket(ticket);
    const firstName = ticket.name ? ticket.name.split(" ")[0] : "Student";
    
    const defaultMessage = `Dear ${firstName},

We are writing to inform you that your support query regarding "${ticket.query.substring(0, 50)}..." has been resolved.

If you have any further questions, please feel free to reach out.

Best regards,
Support Team`;

    setReplyText(defaultMessage);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setReplyText("");
  };

  // Mark as Solved (API Call)
  const confirmSolve = async () => {
    if (!selectedTicket) return;

    try {
      const token = await getToken();
      const { data } = await axios.put(
        `${backendUrl}/api/tickets/${selectedTicket._id}/solve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Ticket marked as resolved");
        setTickets((prev) =>
          prev.map((t) =>
            t._id === selectedTicket._id ? { ...t, status: "solved" } : t
          )
        );
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error updating ticket");
    }
  };

  // Send Email & Solve
  const handleSendEmailAndSolve = () => {
    if (!selectedTicket) return;

    const subject = encodeURIComponent(`Re: Support Ticket - ${selectedTicket.query.substring(0, 30)}...`);
    const body = encodeURIComponent(replyText);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${selectedTicket.email}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');

    setTimeout(() => {
        confirmSolve();
    }, 1000);
  };

  useEffect(() => {
    if (isEducator) {
      fetchTickets();
    }
  }, [isEducator]);

  // Filter tickets based on status
  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus === "all") return true;
    return ticket.status === filterStatus;
  });

  // Smooth shimmer animation keyframes
  const smoothShimmerKeyframes = `
    @keyframes smoothShimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    .animate-smooth-shimmer {
      animation: smoothShimmer 2.5s infinite ease-in-out;
      background-size: 200% 100%;
    }
  `;

  // YouTube-style skeleton loader with smoother animation
  const SkeletonTicket = () => (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
            <div className="h-4 w-20 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
            <div className="h-5 w-1/2 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-full" />
            <div className="h-4 w-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
          </div>
        </div>
        <div className="flex md:flex-col lg:flex-row items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 mt-2 md:mt-0 w-full md:w-auto">
          <div className="h-8 w-8 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-lg" />
          <div className="h-10 w-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-lg" />
        </div>
      </div>
    </div>
  );

  // Loading indicator component - ONLY animation during loading
  const LoadingIndicator = () => (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10 font-sans">
      {/* YouTube-style loading bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
          initial={{ width: "0%" }}
          animate={{ width: `${loadingProgress}%` }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
      </div>

      <style>{smoothShimmerKeyframes}</style>

      <div className="max-w-5xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
            <div className="h-4 w-64 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-16 w-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-xl" />
            <div className="h-16 w-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-xl" />
          </div>
        </div>

        {/* Filter tabs skeleton */}
        <div className="flex gap-2 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-smooth-shimmer rounded-lg" />
          ))}
        </div>

        {/* Tickets skeleton */}
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonTicket key={i} />
          ))}
        </div>
      </div>
    </div>
  );

  // Error/Offline state - Minimal animation
  const ErrorState = ({ message, isOffline }) => (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10 font-sans flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="inline-block p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
          {isOffline ? (
            <WifiOff className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          ) : (
            <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
          )}
          
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {isOffline ? "You're offline" : "Something went wrong"}
          </h3>
          
          <p className="text-gray-500 mb-6">
            {message || (isOffline 
              ? "Please check your internet connection and try again." 
              : "We couldn't load the support tickets. Please try again.")}
          </p>

          <button
            onClick={fetchTickets}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  // Empty state - Minimal animation (only scale for visual feedback)
  const EmptyState = () => (
    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 mx-auto max-w-lg">
      <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Inbox className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">No Tickets Yet</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
        {filterStatus !== "all" 
          ? `No ${filterStatus} tickets found.` 
          : "Great job! All student inquiries have been handled."}
      </p>
      {filterStatus !== "all" && (
        <button
          onClick={() => setFilterStatus("all")}
          className="mt-4 px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Show All Tickets
        </button>
      )}
    </div>
  );

  if (loading) return <LoadingIndicator />;
  if (isOffline) return <ErrorState isOffline={true} />;
  if (error) return <ErrorState message={error} isOffline={false} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 sm:p-6 md:p-10 font-sans text-gray-800 relative overflow-hidden">
      {/* Add smooth shimmer animation styles - only used in loading state */}
      <style>
        {`
          @keyframes smoothShimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          .animate-smooth-shimmer {
            animation: smoothShimmer 2.5s infinite ease-in-out;
            background-size: 200% 100%;
          }
        `}
      </style>

      {/* Background blobs - static */}
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-200/30 blur-3xl rounded-full -z-10"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-indigo-200/30 blur-3xl rounded-full -z-10"></div>
      
      {/* --- Header Section - Static with hover only --- */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            Support Dashboard
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">Manage and resolve student inquiries.</p>
        </div>
        
        {/* Stats Row - Static with hover only */}
        <div className="flex w-full md:w-auto gap-3 sm:gap-4 overflow-x-auto pb-2 md:pb-0">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center min-w-[100px] flex-1 md:flex-none hover:shadow-md transition-shadow">
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
            <span className="text-xl sm:text-2xl font-bold text-gray-800">{tickets.length}</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center min-w-[100px] flex-1 md:flex-none hover:shadow-md transition-shadow">
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</span>
            <span className="text-xl sm:text-2xl font-bold text-amber-500">{tickets.filter(t => t.status === "open").length}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs - Static with hover only */}
      <div className="max-w-5xl mx-auto mb-6 flex gap-2">
        {["all", "open", "solved"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filterStatus === status
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "bg-white/80 text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {status} {status === "all" ? `(${tickets.length})` : `(${tickets.filter(t => t.status === status).length})`}
          </button>
        ))}
      </div>

      {/* --- Ticket List - Static with hover only --- */}
      <div className="max-w-5xl mx-auto">
        {filteredTickets.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket._id} 
                className={`bg-white/80 backdrop-blur-sm rounded-xl p-5 border shadow-sm hover:shadow-lg transition-shadow
                  ${ticket.status === "open" 
                    ? "border-l-4 border-l-amber-400 border-gray-200" 
                    : "border-l-4 border-l-green-500 border-gray-200 opacity-80"
                  }`}
              >
                <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between">
                  
                  {/* Left Side: Content */}
                  <div className="flex-1 min-w-0">
                    
                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold uppercase tracking-wide 
                        ${ticket.status === 'open' 
                          ? 'bg-amber-50 text-amber-600' 
                          : 'bg-green-50 text-green-600'
                        }`}>
                        {ticket.status === 'open' ? 'Action Required' : 'Resolved'}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Query Text */}
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 leading-snug mb-3 break-words">
                      {ticket.query}
                    </h3>

                    {/* User Info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {ticket.name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-gray-700 truncate max-w-[120px]">{ticket.name}</span>
                      </div>
                      <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        {ticket.email}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex md:flex-col lg:flex-row items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 mt-2 md:mt-0 w-full md:w-auto">
                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDeleteTicket(ticket._id)} 
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    {/* Resolve Button */}
                    {ticket.status === "open" ? (
                      <button 
                        onClick={() => openSolveModal(ticket)} 
                        className="flex-1 md:flex-none w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white text-sm font-medium rounded-lg transition-all shadow-md whitespace-nowrap"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolve
                      </button>
                    ) : (
                      <div className="flex-1 md:flex-none w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-500 text-sm font-medium rounded-lg cursor-default whitespace-nowrap">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Done
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Responsive Modal - Animated (only modal needs animation) --- */}
      <AnimatePresence>
        {showModal && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white shrink-0">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Resolve Ticket</h3>
                  <p className="text-xs text-gray-500">Replying to {selectedTicket.name?.split(' ')[0] || 'Student'}</p>
                </div>
                <button 
                  onClick={closeModal} 
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 overflow-y-auto">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {selectedTicket.name?.charAt(0) || '?'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 truncate">{selectedTicket.name}</p>
                    <p className="text-xs text-blue-600 truncate">{selectedTicket.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <div className="relative">
                    <textarea 
                      className="w-full h-40 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm leading-relaxed resize-none text-gray-700 bg-gray-50 focus:bg-white transition-all outline-none" 
                      value={replyText} 
                      onChange={(e) => setReplyText(e.target.value)} 
                      placeholder="Type your response..."
                    />
                  </div>
                  <div className="flex items-start gap-2 mt-2 text-xs text-gray-500">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
                    <p>This text will open in your default email app.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                <button 
                  onClick={confirmSolve} 
                  className="w-full sm:w-auto px-4 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  Resolve Only
                </button>
                <button 
                  onClick={handleSendEmailAndSolve} 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg text-sm shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Send & Resolve
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportTickets;