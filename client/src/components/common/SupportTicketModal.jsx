import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext"; // To get backendUrl
import { useAuth } from "@clerk/clerk-react";

const SupportTicketModal = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const { backendUrl } = useContext(AppContext); // Backend URL from context
  const { getToken } = useAuth(); // Clerk token for auth

  const submitTicket = async () => {
    if (!query.trim()) {
      toast.error("Please enter your issue");
      return;
    }

    setLoading(true);

    try {
      // Get auth token (optional if backend requires login)
      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/tickets`,
        { query },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Ticket submitted successfully");
        setQuery("");
        onClose();
      } else {
        toast.error(data.message || "Failed to submit ticket");
        console.error("Ticket submission failed:", data);
      }
    } catch (error) {
      console.error("Ticket submission error:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      const serverMessage =
        error.response?.data?.message ||
        "Failed to submit ticket. Please try again later.";
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Raise a Support Ticket</h2>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your issue..."
          className="w-full border rounded-lg p-3 min-h-[120px]"
        />

        <button
          onClick={submitTicket}
          disabled={loading}
          className={`w-full mt-4 py-2 rounded-lg ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </div>
    </div>
  );
};

export default SupportTicketModal;
