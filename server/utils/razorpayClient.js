import Razorpay from "razorpay";

const sanitizeEnvValue = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "undefined" ||
    value === "null"
  ) {
    return undefined;
  }
  return value;
};

export class RazorpayConfigError extends Error {
  constructor() {
    super(
      "Missing Razorpay credentials. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
    this.name = "RazorpayConfigError";
  }
}

let razorpayInstance = null;

export const getRazorpayClient = () => {
  const keyId = sanitizeEnvValue(process.env.RAZORPAY_KEY_ID);
  const keySecret = sanitizeEnvValue(process.env.RAZORPAY_KEY_SECRET);

  // Enhanced error logging for debugging
  if (!keyId || !keySecret) {
    console.error("❌ Razorpay Configuration Error:");
    console.error("  RAZORPAY_KEY_ID:", keyId ? "✅ Set" : "❌ Missing");
    console.error(
      "  RAZORPAY_KEY_SECRET:",
      keySecret ? "✅ Set" : "❌ Missing"
    );
    console.error(
      "  All env vars:",
      Object.keys(process.env)
        .filter((k) => k.includes("RAZORPAY"))
        .join(", ") || "None found"
    );
    throw new RazorpayConfigError();
  }

  if (!razorpayInstance) {
    try {
      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      console.log("✅ Razorpay client initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Razorpay client:", error.message);
      throw new RazorpayConfigError();
    }
  }

  return razorpayInstance;
};
