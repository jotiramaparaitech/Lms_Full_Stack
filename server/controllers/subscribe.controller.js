import sendNewsletterEmail from "../utils/sendNewsletterEmail.js";

export const subscribe = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Respond fast; send email in background
  res.status(202).json({ success: true, message: "Subscription received" });

  sendNewsletterEmail(email).catch((error) => {
    console.error("Newsletter email error:", error);
  });
};
