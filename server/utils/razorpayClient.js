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
  // Trim whitespace from the value
  const trimmed = typeof value === "string" ? value.trim() : value;
  // Return undefined if trimmed value is empty
  return trimmed === "" ? undefined : trimmed;
};

const validateRazorpayKey = (keyId, keySecret) => {
  const errors = [];

  if (!keyId || keyId.trim() === "") {
    errors.push("RAZORPAY_KEY_ID is empty or missing");
  } else if (!keyId.startsWith("rzp_")) {
    errors.push(
      `RAZORPAY_KEY_ID format is invalid. Should start with "rzp_" but got: ${keyId.substring(
        0,
        10
      )}...`
    );
  }

  if (!keySecret || keySecret.trim() === "") {
    errors.push("RAZORPAY_KEY_SECRET is empty or missing");
  } else if (keySecret.length < 20) {
    errors.push(
      "RAZORPAY_KEY_SECRET appears to be too short (should be at least 20 characters)"
    );
  }

  return errors;
};

export class RazorpayConfigError extends Error {
  constructor(message) {
    super(
      message ||
        "Payment Failed because of a configuration error. Missing Razorpay credentials. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables."
    );
    this.name = "RazorpayConfigError";
  }
}

let razorpayInstance = null;

export const getRazorpayClient = () => {
  const rawKeyId = process.env.RAZORPAY_KEY_ID;
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;

  const keyId = sanitizeEnvValue(rawKeyId);
  const keySecret = sanitizeEnvValue(rawKeySecret);

  // Enhanced error logging for debugging
  if (!keyId || !keySecret) {
    console.error("❌ Razorpay Configuration Error:");
    console.error(
      "  RAZORPAY_KEY_ID:",
      keyId ? `✅ Set (${keyId.substring(0, 10)}...)` : "❌ Missing or empty"
    );
    console.error(
      "  RAZORPAY_KEY_SECRET:",
      keySecret ? "✅ Set (***hidden***)" : "❌ Missing or empty"
    );
    console.error("  Raw values check:", {
      keyIdExists: !!rawKeyId,
      keyIdLength: rawKeyId?.length || 0,
      keySecretExists: !!rawKeySecret,
      keySecretLength: rawKeySecret?.length || 0,
    });
    console.error(
      "  All env vars:",
      Object.keys(process.env)
        .filter((k) => k.includes("RAZORPAY"))
        .join(", ") || "None found"
    );
    throw new RazorpayConfigError();
  }

  // Validate key format
  const validationErrors = validateRazorpayKey(keyId, keySecret);
  if (validationErrors.length > 0) {
    console.error("❌ Razorpay Key Validation Error:");
    validationErrors.forEach((err) => console.error(`  - ${err}`));
    const error = new RazorpayConfigError();
    error.message = validationErrors.join("; ");
    throw error;
  }

  if (!razorpayInstance) {
    try {
      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      console.log("✅ Razorpay client initialized successfully");
      console.log(`  Key ID: ${keyId.substring(0, 10)}...`);
    } catch (error) {
      console.error("❌ Failed to initialize Razorpay client:");
      console.error("  Error message:", error.message);
      console.error("  Error type:", error.constructor.name);
      console.error("  Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack?.split("\n")[0],
      });

      // If it's a Razorpay SDK error, provide more context
      if (error.message && error.message.includes("Authentication key")) {
        const configError = new RazorpayConfigError();
        configError.message = `Payment Failed because of a configuration error. Authentication key was missing during initialization. Please check that your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correct and properly set in your environment variables.`;
        throw configError;
      }

      // Handle other Razorpay SDK initialization errors
      if (error.message) {
        const configError = new RazorpayConfigError();
        configError.message = `Payment Failed because of a configuration error. ${error.message}. Please verify your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.`;
        throw configError;
      }

      throw new RazorpayConfigError();
    }
  }

  return razorpayInstance;
};
