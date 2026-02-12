import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendTeamAnnouncement = async (recipients, teamName, leaderName, content, fileUrl) => {
  if (!recipients || recipients.length === 0) return;

  // Format Date (e.g., "Friday, February 14, 2025")
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Simplified File Link
  const fileSection = fileUrl 
    ? `<p><b>Attachment:</b> <a href="${fileUrl}">Click here to download file</a></p>` 
    : "";

  // Optimized HTML Template
  const htmlTemplate = `
    <p>Hello,</p>

    <p>A new announcement has been posted in <b>${teamName}</b>.</p>

    <p>
      <b>From:</b> ${leaderName} (Team Leader)<br>
      <b>Date:</b> ${date}
    </p>

    <hr style="border:0; border-top:1px solid #ddd; margin: 15px 0;">

    <div>
      ${content}
    </div>

    ${fileSection}

    <hr style="border:0; border-top:1px solid #ddd; margin: 15px 0;">

    <p>Please <a href="${process.env.FRONTEND_URL}/student/apps/teams">log in to your LMS Dashboard</a> to view the full details. If you have any questions regarding this update, please submit a support ticket via the <b>Help & Support</b> section.</p>

    <p>Best regards,<br>
    Aparaitech Support Team</p>
  `;

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    bcc: recipients, 
    subject: `[Announcement] New message in ${teamName}`,
    html: htmlTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Announcement email sent to ${recipients.length} members`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};