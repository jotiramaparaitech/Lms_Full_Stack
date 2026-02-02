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

const sendNewsletterEmail = async (email) => {
  await Promise.all([
    // 1️⃣ Email to USER
    transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Welcome to Aparaitech Newsletter 🎉",
      html: `
        <h3>Welcome 👋</h3>
        <p>Thank you for subscribing to <strong>${process.env.FROM_NAME}</strong>.</p>
        <p>You’ll now receive updates, tutorials, and announcements.</p>
        <p>Regards,<br/>${process.env.FROM_NAME} Team</p>
      `,
    }),

    // 2️⃣ Email to COMPANY
    transporter.sendMail({
      from: `"Website" <${process.env.FROM_EMAIL}>`,
      to: process.env.FROM_EMAIL,
      subject: "New Newsletter Subscription",
      html: `
        <p>A new user has subscribed to the newsletter.</p>
        <p><strong>Email:</strong> ${email}</p>
      `,
    }),
  ]);
};

export default sendNewsletterEmail;
