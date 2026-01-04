// Suppress harmless Razorpay SDK console warnings EARLY
// These are browser security warnings that cannot be fixed from our side
// Must be set up before any other code runs
const shouldSuppressWarning = (message) => {
  if (!message) return false;
  const msg = String(message).toLowerCase();

  // Filter out Razorpay's harmless "Refused to get unsafe header" warnings
  if (
    msg.includes("refused to get unsafe header") &&
    msg.includes("x-rtb-fingerprint-id")
  ) {
    return true;
  }

  // Filter out SVG height="auto" warnings (these are handled by sanitizeHTML)
  if (
    msg.includes("expected length") &&
    msg.includes("height") &&
    msg.includes("auto")
  ) {
    return true;
  }

  // Filter out SVG width="auto" warnings
  if (
    msg.includes("expected length") &&
    msg.includes("width") &&
    msg.includes("auto")
  ) {
    return true;
  }

  return false;
};

// Override console.error
const originalError = console.error;
console.error = function (...args) {
  const message = args[0]?.toString() || "";
  if (shouldSuppressWarning(message)) {
    return; // Suppress this warning
  }
  originalError.apply(console, args);
};

// Override console.warn (Razorpay might use warn instead of error)
const originalWarn = console.warn;
console.warn = function (...args) {
  const message = args[0]?.toString() || "";
  if (shouldSuppressWarning(message)) {
    return; // Suppress this warning
  }
  originalWarn.apply(console, args);
};

import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext.jsx";
import { ClerkProvider } from "@clerk/clerk-react";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </ClerkProvider>
  </BrowserRouter>
);
