import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import HelpCenter from "./HelpCenter"; // Import the new component
import { Headphones } from "lucide-react";

const SupportTicketButton = () => {
  const { isSignedIn } = useUser();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!isSignedIn) {
      toast.info("Please login to access support");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      {/* Floating Help & Support Button */}
      <button
        onClick={handleClick}
        className="
          fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[9999]
          flex items-center gap-1.5 sm:gap-2
          bg-[#2F415D] text-white
          px-3 py-2 sm:px-5 sm:py-3
          rounded-full
          shadow-lg
          transition-all duration-300
          hover:shadow-2xl hover:scale-105
          active:scale-95
        "
      >
        <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
          Help & Support
        </span>
      </button>

      {/* Render the Help Center (Menu) instead of the Modal directly */}
      {open && <HelpCenter onClose={() => setOpen(false)} />}
    </>
  );
};

export default SupportTicketButton;