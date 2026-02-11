import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,  
  port: Number(process.env.SMTP_PORT),  
  secure: Number(process.env.SMTP_PORT) === 465,  
  pool: true,  
  maxConnections: 5,   
  maxMessages: 100,   
  connectionTimeout: 10_000,   
  greetingTimeout: 10_000,   
  socketTimeout: 20_000,   
  auth: { 
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendSupportMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Respond fast; send emails in background
    res.status(202).json({ success: true, message: "Support request received" });

    Promise.all([
      // 1️⃣ Email to USER (confirmation)
      transporter.sendMail({
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: "We received your support request 🎧",
        html: `
          <p>Hi ${name},</p>
          <p>Thanks for contacting <strong>${process.env.FROM_NAME}</strong>.</p>
          <p>Our support team has received your message and will respond shortly.</p>
          <br/>
          <p>Regards,<br/>${process.env.FROM_NAME} Support Team</p>
        `,
      }),

      // 2️⃣ Email to COMPANY
      transporter.sendMail({
        from: `"Support Bot" <${process.env.FROM_EMAIL}>`,
        to: process.env.FROM_EMAIL,
        subject: "New Support Request",
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      }),
    ]).catch((err) => {
      console.error("Support email error:", err);
    });
  } catch (err) {
    console.error("Support email error:", err);
    res.status(500).json({ message: "Failed to send support message" });
  }
};
