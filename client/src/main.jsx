// Suppress only specific harmless Razorpay console errors
const shouldSuppressError = (message) => {
  if (!message) return false;
  const msgStr = String(message).toLowerCase();

  // Only suppress these specific errors:
  // 1. "Refused to get unsafe header "x-rtb-fingerprint-id""
  if (msgStr.includes("refused to get unsafe header") && msgStr.includes("x-rtb-fingerprint-id")) {
    return true;
  }

  // 2. "Error: <svg> attribute width: Expected length, "auto"."
  if (msgStr.includes("svg") && msgStr.includes("attribute") && msgStr.includes("width") && msgStr.includes("expected length") && msgStr.includes("auto")) {
    return true;
  }

  // 3. "Error: <svg> attribute height: Expected length, "auto"."
  if (msgStr.includes("svg") && msgStr.includes("attribute") && msgStr.includes("height") && msgStr.includes("expected length") && msgStr.includes("auto")) {
    return true;
  }

  // 4. Mixed Content warnings (harmless, auto-upgraded)
  if (msgStr.includes("mixed content") && msgStr.includes("automatically upgraded")) {
    return true;
  }

  return false;
};

// Override console.error - check all arguments, including Error objects
const originalError = console.error;
console.error = function (...args) {
  // Check all arguments for the error message
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg && shouldSuppressError(arg)) {
      return; // Suppress this error
    }
    // Also check Error object's message property
    if (arg && typeof arg === 'object' && arg.message && shouldSuppressError(arg.message)) {
      return; // Suppress this error
    }
    // Check toString() representation
    if (arg && shouldSuppressError(String(arg))) {
      return; // Suppress this error
    }
  }
  originalError.apply(console, args);
};

// Override console.warn as well (some browsers log errors as warnings)
const originalWarn = console.warn;
console.warn = function (...args) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg && shouldSuppressError(arg)) {
      return;
    }
    if (arg && typeof arg === 'object' && arg.message && shouldSuppressError(arg.message)) {
      return;
    }
    if (arg && shouldSuppressError(String(arg))) {
      return;
    }
  }
  originalWarn.apply(console, args);
};

// Also catch errors thrown from scripts via window.onerror
const origOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
  try {
    if (message && shouldSuppressError(String(message))) {
      return true; // Suppress the error
    }
    if (error && error.message && shouldSuppressError(error.message)) {
      return true; // Suppress the error
    }
    if (error && error.toString && shouldSuppressError(error.toString())) {
      return true; // Suppress the error
    }
    // Call original handler if it exists
    if (origOnError) {
      return origOnError.apply(window, arguments);
    }
  } catch (e) {
    if (origOnError) {
      return origOnError.apply(window, arguments);
    }
  }
  return false;
};

// Also catch unhandled promise rejections
const origUnhandledRejection = window.onunhandledrejection;
window.onunhandledrejection = function (event) {
  try {
    const reason = event.reason;
    if (reason && shouldSuppressError(String(reason))) {
      event.preventDefault();
      return false;
    }
    if (reason && reason.message && shouldSuppressError(reason.message)) {
      event.preventDefault();
      return false;
    }
    if (reason && reason.toString && shouldSuppressError(reason.toString())) {
      event.preventDefault();
      return false;
    }
    if (origUnhandledRejection) {
      return origUnhandledRejection.call(window, event);
    }
  } catch (e) {
    if (origUnhandledRejection) {
      return origUnhandledRejection.call(window, event);
    }
  }
};

// Also use addEventListener for error events (catches more error types)
window.addEventListener('error', function(event) {
  try {
    if (event.message && shouldSuppressError(String(event.message))) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    if (event.error && event.error.message && shouldSuppressError(event.error.message)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    if (event.error && event.error.toString && shouldSuppressError(event.error.toString())) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  } catch (e) {
    // Ignore errors in error handler
  }
}, true); // Use capture phase to catch early

// Also listen for unhandled promise rejections via addEventListener
window.addEventListener('unhandledrejection', function(event) {
  try {
    const reason = event.reason;
    if (reason && shouldSuppressError(String(reason))) {
      event.preventDefault();
      return false;
    }
    if (reason && reason.message && shouldSuppressError(reason.message)) {
      event.preventDefault();
      return false;
    }
    if (reason && reason.toString && shouldSuppressError(reason.toString())) {
      event.preventDefault();
      return false;
    }
  } catch (e) {
    // Ignore errors in error handler
  }
});

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
