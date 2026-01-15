import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext"; // Assuming you have a context for backendUrl
import { CheckCircle, Clock, MessageSquare, Mail, User } from "lucide-react";
import { assets } from "../../assets/assets"; // Using your assets for loading if needed

const SupportTickets = () => {
  const { backendUrl, currency, isEducator } = useContext(AppContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch All Tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Adjust the route matches your backend server.js configuration
      const { data } = await axios.get(`${backendUrl}/api/tickets/educator`);
      
      if (data.success) {
        setTickets(data.tickets);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark Ticket as Solved
  const handleSolveTicket = async (ticketId) => {
    try {
      const { data } = await axios.put(`${backendUrl}/api/tickets/${ticketId}/solve`);

      if (data.success) {
        toast.success("Ticket marked as Solved!");
        
        // Optimistically update UI without full reload
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket._id === ticketId ? { ...ticket, status: "solved" } : ticket
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating ticket status");
    }
  };

  useEffect(() => {
    if (isEducator) {
      fetchTickets();
    }
  }, [isEducator]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Support Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Manage student queries and issues.</p>
        </div>
        
        {/* Simple Stats */}
        <div className="flex gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center min-w-[100px]">
                <span className="text-xs text-gray-500 font-semibold uppercase">Total</span>
                <span className="text-xl font-bold text-blue-600">{tickets.length}</span>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center min-w-[100px]">
                <span className="text-xs text-gray-500 font-semibold uppercase">Open</span>
                <span className="text-xl font-bold text-amber-500">
                    {tickets.filter(t => t.status === 'open').length}
                </span>
            </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tickets.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No support tickets found.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div 
                key={ticket._id} 
                className={`bg-white rounded-xl p-6 border transition-all duration-300 hover:shadow-md
                ${ticket.status === 'open' ? 'border-amber-100 border-l-4 border-l-amber-400' : 'border-gray-100 border-l-4 border-l-green-500 opacity-80'}`}
              >
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  
                  {/* Left Side: User Info & Query */}
                  <div className="flex-1 space-y-3">
                    {/* User Details */}
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                            <User className="w-3 h-3" /> 
                            <span className="font-medium text-gray-700">{ticket.name}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                            <Mail className="w-3 h-3" /> 
                            <span>{ticket.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    {/* The Query */}
                    <div className="mt-2">
                        <h3 className="text-gray-800 font-medium text-lg leading-snug">
                            {ticket.query}
                        </h3>
                    </div>
                  </div>

                  {/* Right Side: Status & Action */}
                  <div className="flex items-center gap-3 self-end md:self-start min-w-fit">
                    {ticket.status === "open" ? (
                        <button
                            onClick={() => handleSolveTicket(ticket._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md transition-colors active:scale-95"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Mark Solved
                        </button>
                    ) : (
                        <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg border border-green-200 cursor-default">
                            <CheckCircle className="w-4 h-4" />
                            Solved
                        </span>
                    )}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SupportTickets;