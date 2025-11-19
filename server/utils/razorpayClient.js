import Razorpay from "razorpay";

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
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new RazorpayConfigError();
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
};
