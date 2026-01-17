import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import {
  CheckCircle,
  Clock,
  MessageSquare,
  Mail,
  Trash2,
  X,
  Send,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";

const SupportTickets = () => {
  const { backendUrl, isEducator, getToken } = useContext(AppContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Fetch Tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get(
        `${backendUrl}/api/tickets/educator`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setTickets(data.tickets);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
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

We are writing to inform you that your support query regarding "${ticket.query}" has been resolved.

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10 font-sans text-gray-800">
      
      {/* --- Header Section --- */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Support Dashboard</h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">Manage and resolve student inquiries.</p>
        </div>
        
        {/* Stats Row */}
        <div className="flex w-full md:w-auto gap-3 sm:gap-4 overflow-x-auto pb-2 md:pb-0">
          <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center min-w-[100px] flex-1 md:flex-none">
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
            <span className="text-xl sm:text-2xl font-bold text-gray-800">{tickets.length}</span>
          </div>
          <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center min-w-[100px] flex-1 md:flex-none">
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</span>
            <span className="text-xl sm:text-2xl font-bold text-amber-500">{tickets.filter(t => t.status === "open").length}</span>
          </div>
        </div>
      </div>

      {/* --- Ticket List --- */}
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 mx-auto max-w-lg">
            <div className="bg-gray-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No Tickets Yet</h3>
            <p className="text-sm text-gray-500 mt-1">Great job! All queries handled.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tickets.map((ticket) => (
              <div 
                key={ticket._id} 
                className={`bg-white rounded-xl p-5 border shadow-sm transition-all hover:shadow-md 
                ${ticket.status === "open" ? "border-l-4 border-l-amber-400 border-gray-100" : "border-l-4 border-l-green-500 border-gray-100 opacity-80"}`}
              >
                <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between">
                  
                  {/* Left Side: Content */}
                  <div className="flex-1 min-w-0"> {/* min-w-0 fixes flex child overflow */}
                    
                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold uppercase tracking-wide 
                        ${ticket.status === 'open' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                        {ticket.status === 'open' ? 'Action Required' : 'Resolved'}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Query Text - Wraps properly now */}
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 leading-snug mb-3 break-words">
                      {ticket.query}
                    </h3>

                    {/* User Info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                          {ticket.name.charAt(0)}
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

                  {/* Right Side: Actions (Stacked on Mobile, Row on Desktop) */}
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
                        className="flex-1 md:flex-none w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all active:scale-95 whitespace-nowrap"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolve
                      </button>
                    ) : (
                      <div className="flex-1 md:flex-none w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 text-gray-500 text-sm font-medium rounded-lg cursor-default whitespace-nowrap">
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

      {/* --- Responsive Modal --- */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Resolve Ticket</h3>
                <p className="text-xs text-gray-500">Replying to {selectedTicket.name.split(' ')[0]}</p>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable if needed) */}
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                    {selectedTicket.name.charAt(0)}
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
                  ></textarea>
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-sm active:scale-95"
              >
                <Send className="w-4 h-4" />
                Send & Resolve
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;