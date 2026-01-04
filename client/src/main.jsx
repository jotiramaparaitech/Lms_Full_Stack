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

// Suppress harmless Razorpay SDK console warnings
// These are browser security warnings that cannot be fixed from our side
const originalError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || "";
  // Filter out Razorpay's harmless "Refused to get unsafe header" warnings
  if (
    message.includes("Refused to get unsafe header") &&
    message.includes("x-rtb-fingerprint-id")
  ) {
    return; // Suppress this warning
  }
  // Filter out SVG height="auto" warnings (these are handled by sanitizeHTML)
  if (
    message.includes("Expected length") &&
    message.includes("height") &&
    message.includes("auto")
  ) {
    return; // Suppress this warning
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </ClerkProvider>
  </BrowserRouter>
);
