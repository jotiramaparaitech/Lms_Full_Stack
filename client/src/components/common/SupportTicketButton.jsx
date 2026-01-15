import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import SupportTicketModal from "./SupportTicketModal";
import supportIcon from "../../assets/support.png";

const SupportTicketButton = () => {
  const { isSignedIn } = useUser();
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!isSignedIn) {
      toast.info("Please login to raise a support ticket");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      {/* Floating Support Button */}
      <button
        onClick={handleClick}
        className="
         bg-white shadow-lg rounded-full p-3
        transform transition-all duration-300
        hover:scale-110 hover:shadow-2xl hover:-translate-y-1 hover:rotate-3
        "
        style={{
          transform: "translateY(-2%)", // ✅ move button slightly upward
        }}
      >
        <img
          src={supportIcon}
          alt="Support"
          className="w-9 h-9"
        />
      </button>

      {/* Modal */}
      {open && <SupportTicketModal onClose={() => setOpen(false)} />}
    </>
  );
};

export default SupportTicketButton;
