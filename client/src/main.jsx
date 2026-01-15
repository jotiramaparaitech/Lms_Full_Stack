// Suppress harmless Razorpay SDK console warnings EARLY
// These are browser security warnings that cannot be fixed from our side
// Must be set up before any other code runs
const shouldSuppressWarning = (message) => {
  if (!message) return false;
  const msg = String(message).toLowerCase();
  const msgStr = String(message);
  const fullMsg = JSON.stringify(arguments).toLowerCase();

  // Filter out Razorpay's harmless "Refused to get unsafe header" warnings (various formats)
  if (
    (msg.includes("refused to get unsafe header") &&
      (msg.includes("x-rtb-fingerprint-id") || msg.includes("fingerprint"))) ||
    msgStr.includes("x-rtb-fingerprint-id") ||
    fullMsg.includes("x-rtb-fingerprint-id")
  ) {
    return true;
  }

  // Filter out SVG height/width="auto" warnings (these are handled by sanitizeHTML)
  if (
    (msg.includes("expected length") &&
      (msg.includes("height") || msg.includes("width")) &&
      (msg.includes("auto") || msg.includes('"auto"'))) ||
    (msg.includes("svg") && msg.includes("attribute") && (msg.includes("auto") || msg.includes("width") || msg.includes("height"))) ||
    (msgStr.includes("<svg>") && msgStr.includes("auto")) ||
    (msgStr.includes("attribute width") && msgStr.includes("auto")) ||
    (msgStr.includes("attribute height") && msgStr.includes("auto"))
  ) {
    return true;
  }

  // Filter permissions policy violations (harmless)
  if (
    msg.includes("permissions policy violation") ||
    msg.includes("accelerometer is not allowed") ||
    msg.includes("devicemotion events are blocked") ||
    msg.includes("deviceorientation events are blocked") ||
    msg.includes("[violation] permissions policy") ||
    fullMsg.includes("permissions policy")
  ) {
    return true;
  }

  // Filter CORS warnings from Razorpay (harmless)
  if (
    (msg.includes("cors policy") || msg.includes("cross-origin")) &&
    (msg.includes("razorpay") || msg.includes("api.razorpay.com") || msg.includes("checkout.razorpay.com"))
  ) {
    return true;
  }

  // Filter mixed content warnings (auto-upgraded)
  if (
    (msg.includes("mixed content") || msg.includes("insecure element")) &&
    (msg.includes("automatically upgraded") || msg.includes("upgraded to https"))
  ) {
    return true;
  }

  // Filter Razorpay script errors (from their internal scripts)
  if (
    msgStr.includes("v2-entry") ||
    msgStr.includes("checkout-static") ||
    (msgStr.includes("razorpay") && (msg.includes("error") || msg.includes("warning")))
  ) {
    // Only suppress if it's a known harmless error
    if (
      msg.includes("svg") ||
      msg.includes("auto") ||
      msg.includes("fingerprint") ||
      msg.includes("permissions policy") ||
      msg.includes("accelerometer") ||
      msg.includes("devicemotion") ||
      msg.includes("deviceorientation")
    ) {
      return true;
    }
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
