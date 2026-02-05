import React, { useContext, useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import StudentLayout from "../../components/student/StudentLayout";
import { AppContext } from "../../context/AppContext";
import {
  Lock,
  FileText,
  BadgeCheck,
  Award,
  Briefcase,
  UserCheck,
  Download,
  ExternalLink,
  Sparkles,
  Trophy,
  CheckCircle,
  Clock,
  Target,
  ChevronRight,
  Star,
  GraduationCap,
  X,
  Loader,
} from "lucide-react";
import { motion } from "framer-motion";
import logoImg from "../../assets/logo.png";
import logoProgress from "../../assets/logo_progress_certificate.png";
import bgProgress from "../../assets/bg_progress_certificate.png";
import headerLine from "../../assets/Progress_header_line.jpg";
import footerLine from "../../assets/Progress_footer_line.jpg";

const Certificates = () => {
  const { teamProgress, fetchMyTeamProgress, userData, lorUnlocked } =
    useContext(AppContext);

  useEffect(() => {
    fetchMyTeamProgress();
  }, []);

  /* State for certificate */
  const [showModal, setShowModal] = useState(false);
  const [certificateName, setCertificateName] = useState("");
  const [domainName, setDomainName] = useState("");
  const [duration, setDuration] = useState("3-month"); // 🆕 Duration for completion cert
  const [startDate, setStartDate] = useState(""); // 🆕 Start Date for LOR
  const [endDate, setEndDate] = useState(""); // 🆕 End Date for LOR
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate random credential ID with format APA + YY + MM + Serial (7000 series)
  const generateCredentialId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    // Serial starting with 7000, avoiding Math.random()
    // Using milliseconds to give slight variation or fixed if preferred.
    // User requested "start with 7000 series".
    const serial = 7000 + (date.getMilliseconds() % 1000);

    return `APA${year}${month}${serial}`;
  };

  useEffect(() => {
    if (userData) {
      setCertificateName(userData.name || "");
    }
  }, [userData]);

  const generateCertificate = () => {
    if (!certificateName.trim() || !domainName.trim()) return;

    // Check duration for completion certificate
    if (selectedCertificate?.title === "Project Completion Certificate" && !duration.trim()) return;

    if (selectedCertificate?.title === "Project Progress Certificate") {
      generateProgressCertificate();
    } else if (selectedCertificate?.title === "Project Completion Certificate") {
      generateCompletionCertificate();
    } else if (selectedCertificate?.title === "Letter of Recommendation (LOR)") {
      generateLORCertificate();
    } else {
      // Fallback or other certificates
      generateProgressCertificate();
    }
  };

  // Helper to convert image URL to Base64
  const getBase64ImageFromUrl = async (imageUrl) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Error converting image:", e);
      return null;
    }
  };

  // 🟦 Original Progress Certificate Generation (Teal Design)
  const generateProgressCertificate = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Load images
      const [logoBase64, bgBase64, headerBase64, footerBase64] = await Promise.all([
        getBase64ImageFromUrl(logoProgress),
        getBase64ImageFromUrl(bgProgress),
        getBase64ImageFromUrl(headerLine),
        getBase64ImageFromUrl(footerLine)
      ]);

      const credentialId = generateCredentialId();
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      // Background Color
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, width, height, "F");

      // 🌊 Header Line (Top)
      if (headerBase64) {
        try {
          const hWidth = width;
          const hHeight = 35; // Adjust height to maintain aspect ratio approx
          doc.addImage(headerBase64, "JPEG", 0, 0, hWidth, hHeight);
        } catch (e) {
          console.error("Error adding header line:", e);
        }
      }

      // 🌊 Footer Line (Bottom)
      if (footerBase64) {
        try {
          // Opacity for footer line
          doc.setGState(new doc.GState({ opacity: 0.5 }));

          const fWidth = width;
          const fHeight = 35;
          doc.addImage(footerBase64, "JPEG", 0, height - fHeight, fWidth, fHeight);

          // Reset Opacity
          doc.setGState(new doc.GState({ opacity: 1.0 }));
        } catch (e) {
          console.error("Error adding footer line:", e);
        }
      }

      // 🖼️ Background Image (Mountains)
      if (bgBase64) {
        try {
          // Set opacity for background
          doc.setGState(new doc.GState({ opacity: 0.18 }));

          const bgWidth = 180; // Reduced width from 260
          const bgHeight = 100; // Adjusted height to maintain aspect ratio roughly
          const bgX = (width - bgWidth) / 2;
          const bgY = (height - bgHeight) / 2 + 10;
          doc.addImage(bgBase64, "PNG", bgX, bgY, bgWidth, bgHeight);

          // Reset opacity
          doc.setGState(new doc.GState({ opacity: 1.0 }));
        } catch (e) {
          console.error("Error adding background:", e);
          try { doc.setGState(new doc.GState({ opacity: 1.0 })); } catch (err) { }
        }
      }

      // ⬜ Masking Strategy (Clip images outside border)
      // Border is at 3mm margin. We mask everything outside this 3mm box.
      const margin = 3;
      doc.setFillColor(255, 255, 255);

      // Top Mask
      doc.rect(0, 0, width, margin, "F");
      // Bottom Mask
      doc.rect(0, height - margin, width, margin, "F");
      // Left Mask
      doc.rect(0, 0, margin, height, "F");
      // Right Mask
      doc.rect(width - margin, 0, margin, height, "F");

      // Border lines (Single Border, tighter padding)
      doc.setDrawColor(88, 188, 206);
      doc.setLineWidth(0.5);
      doc.rect(margin, margin, width - (margin * 2), height - (margin * 2));
      // doc.setLineWidth(0.2);
      // doc.rect(8, 8, width - 16, height - 16);

      // 🏢 Company Logo (New Logo)
      if (logoBase64) {
        try {
          const logoWidth = 35; // Slightly larger for the boxed logo
          const logoHeight = 35;
          doc.addImage(logoBase64, "PNG", (width / 2) - (logoWidth / 2), 15, logoWidth, logoHeight);
        } catch (e) {
          doc.setFont("times", "bold");
          doc.text("APARAITECH", width / 2, 30, { align: "center" });
        }
      } else {
        doc.setFont("times", "bold");
        doc.text("APARAITECH", width / 2, 30, { align: "center" });
      }

      // Logo has text in it usually, but if not:
      // doc.setFont("times", "normal");
      // doc.setFontSize(8);
      // doc.text("SOFTWARE COMPANY", width/2, 45, { align: "center" });


      // 🏆 CERTIFICATE Title
      doc.setFont("times", "bold");
      doc.setFontSize(42);
      doc.setTextColor(30, 160, 210); // Cyan/Blue
      doc.text("CERTIFICATE", width / 2, 65, { align: "center" });

      // 🏷️ Domain Name
      doc.setFont("times", "normal");
      doc.setFontSize(32);
      doc.setTextColor(0, 0, 0);
      doc.text(domainName, width / 2, 85, { align: "center" });

      // 👤 PRESENTED TO
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setCharSpace(1);
      doc.setTextColor(80, 80, 80);
      doc.text("PRESENTED TO :", width / 2.1, 100, { align: "center" });

      // 🧑 User Name
      doc.setFont("times", "normal");
      doc.setFontSize(38);
      doc.setTextColor(0, 0, 0);
      doc.setCharSpace(0);
      doc.text(certificateName, width / 2, 120, { align: "center" });

      // 📜 Description text
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      const descLine = "In recognition of successfully reaching the 75% milestone in the Live Project.";
      doc.text(descLine, width / 2, 135, { align: "center" });

      // 📅 Footer
      const date = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
      const bottomY = 165;

      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(date, width / 2, bottomY, { align: "center" });

      doc.setLineWidth(0.5);
      doc.setDrawColor(80, 80, 80);
      doc.line((width / 2) - 20, bottomY + 2, (width / 2) + 20, bottomY + 2);

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text("Issued", width / 2, bottomY + 8, { align: "center" });

      // 🆔 Bottom Info
      const footerY = 190;
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);

      const idText = `Credential ID : ${credentialId}`;
      const linkText = "Certification Verification : lms.aparaitech.org";

      doc.text(idText, (width / 2) - 6, footerY, { align: "right" });
      doc.setDrawColor(200, 200, 200);
      doc.line(width / 2, footerY - 4, width / 2, footerY + 4);
      doc.text(linkText, (width / 2) + 6, footerY, { align: "left" });

      doc.save(`Progress_Certificate_${certificateName.replace(/\s+/g, "_")}.pdf`);
      setShowModal(false);
    } catch (error) {
      console.error("Error generating progress certificate:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🟪 New Completion Certificate Generation (Purple Design)
  const generateCompletionCertificate = () => {
    setLoading(true);
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const credentialId = generateCredentialId();
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      // Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, width, height, "F");

      // 🟣 1. Purple Sidebar (Left)
      const sidebarWidth = 25; // approx width
      doc.setFillColor(138, 43, 226); // BlueViolet / Purple
      doc.rect(10, 10, sidebarWidth, height - 20, "F"); // 10mm margin from top/bottom/left

      // Sidebar Waves (Simulated with yellow/gold lines)
      doc.setDrawColor(255, 215, 0); // Gold
      doc.setLineWidth(0.3);
      // Top waves
      for (let i = 0; i < 5; i++) {
        doc.curveTo(10, 15 + (i * 5), 10 + sidebarWidth, 25 + (i * 5), 10, 35 + (i * 5));
      }
      // Bottom waves
      for (let i = 0; i < 5; i++) {
        doc.curveTo(10, height - 35 - (i * 5), 10 + sidebarWidth, height - 25 - (i * 5), 10, height - 15 - (i * 5));
      }

      // Main Content Area offset
      const contentX = 10 + sidebarWidth + 15; // Start content after sidebar
      const centerX = contentX + ((width - 20 - sidebarWidth - 15) / 2); // Center of content area

      // 🏢 Logo (Top Right)
      try {
        const logoWidth = 30;
        const logoHeight = 30; // Assuming square logo box
        // Draw the container box for logo with shadow effect (gray rect behind)
        doc.setFillColor(220, 220, 220);
        doc.roundedRect(width - 50, 15, 35, 25, 3, 3, "F"); // Shadow/Bg

        // White box on top
        doc.setFillColor(255, 255, 255); // Actually image has gradient/grayish bg, keep gray
        // doc.roundedRect(width - 50, 15, 35, 25, 3, 3, "F");

        doc.addImage(logoImg, "PNG", width - 47, 12, 28, 28);
      } catch (e) {
        // fallback
      }

      // 🟣 CERTIFICATE Title (Left Aligned in Content Area)
      // Font: Serif, Purple
      doc.setFont("times", "normal");
      doc.setFontSize(45);
      doc.setTextColor(138, 43, 226); // Purple
      doc.text("CERTIFICATE", contentX, 50, { align: "left" });

      // OF COMPLETION
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.text("OF COMPLETION", contentX, 65, { align: "left" });

      // PROUDLY PRESENTED TO
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text("PROUDLY PRESENTED TO", contentX, 85, { align: "left" });

      // 🧑 Name
      doc.setFont("times", "normal");
      doc.setFontSize(45);
      doc.setTextColor(0, 0, 0);
      doc.text(certificateName, contentX, 105, { align: "left" });

      // 📜 Body Text
      // "This certificate recognizes the successful completion of a [3-month]..."
      // We need bold text support. jsPDF 'html' is slow, so we use splitText or manual positioning.

      const startWrapY = 130;
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);

      const text1 = `This certificate recognizes the successful completion of a `;
      const textBold1 = `${duration} real-world live project`;
      const text2 = ` in the`;
      const textLine2 = `domain of `;
      const textBold2 = ` ${domainName}`;
      const text3 = ` at `;
      const textBold3 = `Aparaitech Software.`;

      // Line 1
      let cursorX = contentX;
      doc.text(text1, cursorX, startWrapY);
      cursorX += doc.getTextWidth(text1);

      doc.setFont("times", "bold");
      doc.text(textBold1, cursorX, startWrapY);
      cursorX += doc.getTextWidth(textBold1);

      doc.setFont("times", "normal");
      doc.text(text2, cursorX, startWrapY);

      // Line 2
      cursorX = contentX;
      const lineHeight = 7;
      doc.text(textLine2, cursorX, startWrapY + lineHeight);
      cursorX += doc.getTextWidth(textLine2);

      doc.setFont("times", "bold");
      doc.text(textBold2, cursorX, startWrapY + lineHeight);
      cursorX += doc.getTextWidth(textBold2);

      doc.setFont("times", "normal");
      doc.text(text3, cursorX, startWrapY + lineHeight);
      cursorX += doc.getTextWidth(text3);

      doc.setFont("times", "bold");
      doc.text(textBold3, cursorX, startWrapY + lineHeight);

      // Paragraph 2
      const para2Y = startWrapY + lineHeight * 3;
      doc.setFont("times", "normal");
      const p2_1 = "During this period, the candidate gained ";
      const p2_bold1 = "practical experience ";
      const p2_2 = "and demonstrated strong";

      cursorX = contentX;
      doc.text(p2_1, cursorX, para2Y);
      cursorX += doc.getTextWidth(p2_1);

      doc.setFont("times", "bold");
      doc.text(p2_bold1, cursorX, para2Y);
      cursorX += doc.getTextWidth(p2_bold1);

      doc.setFont("times", "normal");
      doc.text(p2_2, cursorX, para2Y);

      const para2_line2Y = para2Y + lineHeight;
      const p3_1 = "commitment while working on ";
      const p3_bold = "industry-oriented projects.";

      cursorX = contentX;
      doc.text(p3_1, cursorX, para2_line2Y);
      cursorX += doc.getTextWidth(p3_1);
      doc.setFont("times", "bold");
      doc.text(p3_bold, cursorX, para2_line2Y);


      // ✍️ Signature (Left Bottom)
      // "Aparaitech Software" text signature style or image placeholder
      // For now, text signature simulation
      const signY = height - 40;
      // doc.addImage(signImg, ...)
      doc.setFont("script", "italic"); // Default fallback often monospaced in basic jsPDF, lets stick to cursive simulation via font if loaded, or just italic
      // Using standard fonts, "ZapfDingbats" is symbol. 'times', 'italic' is best bet.
      doc.setFont("times", "italic");
      doc.setFontSize(20);
      doc.setTextColor(50, 50, 50);
      // Drawing a rough "signature" line/curve
      // doc.text("Signature", contentX + 10, signY); 

      // Aparaitech Software text below signature
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text("Aparaitech Software", contentX, signY + 10);
      doc.setLineWidth(0.5);
      doc.line(contentX - 5, signY + 2, contentX + 40, signY + 2);

      // 🆔 Credential Info (Right Bottom)
      const footerY = height - 20;
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      const dateText = `Date : ${new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}`;
      doc.text(`Credential ID :`, width - 50, footerY - 5);
      doc.text(credentialId, width - 60, footerY);

      doc.text(dateText, width - 60, footerY + 5);

      // Save
      doc.save(`Completion_Certificate_${certificateName.replace(/\s+/g, "_")}.pdf`);
      setShowModal(false);
    } catch (error) {
      console.error("Error generating completion certificate:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🟦 Letter of Recommendation (LOR) Generation
  const generateLORCertificate = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Load Images
      // For LOR we need the logo. Using the standard one.
      const logoBase64 = await getBase64ImageFromUrl(logoImg);

      const credentialId = generateCredentialId();
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      // Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, width, height, "F");

      // 🟦 Border (Simple Blue Border)
      const margin = 5;
      doc.setDrawColor(30, 60, 120); // Dark Blue
      doc.setLineWidth(1);
      doc.rect(margin, margin, width - (margin * 2), height - (margin * 2));
      // Inner thin line
      doc.setLineWidth(0.3);
      doc.rect(margin + 1.5, margin + 1.5, width - (margin * 2 + 3), height - (margin * 2 + 3));

        // 🏢 Header
        const headerY = 15;
        
        // Logo dimensions (fixed aspect look)
        const logoWidth = 24;   // keep width slightly bigger
        const logoHeight = 18;  // reduced height to avoid stretched look
        
        if (logoBase64) {
          doc.addImage(
            logoBase64,
            "PNG",
            15,
            headerY + 2, // slight vertical alignment tweak
            logoWidth,
            logoHeight
          );
        }


      // Company Name & Info (Center-Left)
      const headerTextX = 45;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(30, 60, 120); // Dark Blue
      doc.text("APARAITECH", headerTextX, headerY + 8);

      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      doc.text("SOFTWARE COMPANY", headerTextX + 1, headerY + 13);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 150); // Blue Link
      doc.text("www.aparaitech.org", headerTextX, headerY + 20);
      doc.setTextColor(50, 50, 50);
      doc.text("info@aparaitechsoftware.org", headerTextX, headerY + 25);

      // Address (Right Side)
      const addressX = width - 85;
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      const addressLine1 = "#360, Neeladri Road, Karuna Nagar,";
      const addressLine2 = "Electronic City Phase I, Bengaluru – 560100";
      const addressLine3 = "5H4J+RGO, Anand Nagar Colony, Anandnagar,";
      const addressLine4 = "Ashok Nagar Colony, Baramati, Maharashtra 413102";

      doc.text(addressLine1, addressX, headerY + 5);
      doc.text(addressLine2, addressX, headerY + 10);

      doc.text(addressLine3, addressX, headerY + 20);
      doc.text(addressLine4, addressX, headerY + 25);

      // Divider Line
      doc.setDrawColor(30, 60, 120);
      doc.setLineWidth(1);
      doc.line(15, headerY + 35, width - 15, headerY + 35);


      // 📝 Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 60, 120);
      doc.text("LETTER OF RECOMMENDATION", width / 2, 80, { align: "center" });

      // 👤 To Section
      const contentX = 20;
      let cursorY = 100;
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      doc.text("To,", contentX, cursorY);
      cursorY += 8;
      doc.text(`Name: ${certificateName}`, contentX, cursorY);
      cursorY += 8;
      doc.text(`Domain: ${domainName}`, contentX, cursorY);

      // Date (Right Side)
      const dateStr = new Date().toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });
      doc.text(`Date : ${dateStr}`, width - 20, 105, { align: "right" });

      cursorY += 15;
      doc.text("Dear Candidate,", contentX, cursorY);

      // 📄 Body Content
      cursorY += 10;
      const lineHeight = 6;
      const maxWidth = width - 40;

      // Paragraph 1 with Bold parts
      const p1_start = "It is our pleasure to recommend ";
      const p1_name = `${certificateName}`;
      const p1_mid = ", who was associated with ";
      const p1_comp = "Aparaitech Software";
      const p1_mid2 = " as a Project Associate for a ";
      const p1_dur = "3-month real-world"; // Standardizing for LOR or use duration input if needed
      const p1_mid3 = " live project, from ";
      const p1_dates = `[${startDate}] to [${endDate}].`;

      // Helper for wrapped text with bold support is complex in jsPDF.
      // We'll simplisticly construct it or use splitTextToSize for plain text.
      // For accurate bolding inline, we need to calculate widths.

      // Let's simplify and just write the text cleanly.
      const fullText = `It is our pleasure to recommend ${certificateName}, who was associated with Aparaitech Software as a Project Associate for a 3-month real-world live project, from ${startDate} to ${endDate}.`;

      const splitText1 = doc.splitTextToSize(fullText, maxWidth);
      doc.text(splitText1, contentX, cursorY);
      cursorY += (splitText1.length * lineHeight) + 5;

      const p2 = "During this period, the candidate worked on real-world live projects, gaining hands-on experience in addressing practical industry challenges within a professional project environment.";
      const splitText2 = doc.splitTextToSize(p2, maxWidth);
      doc.text(splitText2, contentX, cursorY);
      cursorY += (splitText2.length * lineHeight) + 5;

      const p3 = "The candidate demonstrated the ability to understand project requirements, apply appropriate tools and technologies, and contribute effectively to project deliverables with responsibility and adaptability.";
      const splitText3 = doc.splitTextToSize(p3, maxWidth);
      doc.text(splitText3, contentX, cursorY);
      cursorY += (splitText3.length * lineHeight) + 5;

      const p4 = "Throughout the association, the candidate displayed strong problem-solving skills, teamwork, and adherence to deadlines and quality standards.";
      const splitText4 = doc.splitTextToSize(p4, maxWidth);
      doc.text(splitText4, contentX, cursorY);
      cursorY += (splitText4.length * lineHeight) + 5;

      const p5 = "This real-world project exposure at Aparaitech Software has equipped the candidate with practical skills and professional confidence for future academic or career opportunities.";
      const splitText5 = doc.splitTextToSize(p5, maxWidth);
      doc.text(splitText5, contentX, cursorY);
      cursorY += (splitText5.length * lineHeight) + 10;

      // Bold Recommendation
      doc.setFont("times", "bold");
      const pRef = "We strongly recommend the candidate and wish them every success in future endeavors.";
      doc.text(pRef, width / 2, cursorY, { align: "center" });


      // 🦶 Footer
      const footY = height - 40;

      // Signature
      doc.setFont("times", "bold");
      doc.text("Signature and Designation", contentX, footY);
      doc.setFont("times", "normal");
      doc.text("(Organization Stamp)", contentX + 5, footY + 5);

      // Credential Info
      const rightX = width - 70;
      doc.setFont("times", "bold");
      doc.text(`Credential ID :`, rightX, footY);
      doc.setFont("times", "normal");
      doc.text(credentialId, rightX + 30, footY);

      doc.setFont("times", "bold");
      doc.text(`Place :`, rightX, footY + 6);
      doc.setFont("times", "normal");
      doc.text("Baramati", rightX + 15, footY + 6);

      // Watermark (Center)
      if (logoBase64) {
        try {
          doc.setGState(new doc.GState({ opacity: 0.05 }));
          const wSize = 100;
          doc.addImage(logoBase64, "PNG", (width / 2) - (wSize / 2), (height / 2) - (wSize / 2), wSize, wSize);
          doc.setGState(new doc.GState({ opacity: 1.0 }));
        } catch (e) { }
      }


      doc.save(`LOR_${certificateName.replace(/\s+/g, "_")}.pdf`);
      setShowModal(false);
    } catch (error) {
      console.error("Error generating LOR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClick = (doc) => {
    setSelectedCertificate(doc);
    setShowModal(true);
  };

  const progress = Number(teamProgress || 0);

  const documents = [
    // {
    //   title: "Live Project Offer Letter",
    //   description: "Official offer letter for the live project",
    //   icon: <FileText />,
    //   unlocked: progress >= 0,
    //   gradient: "from-blue-500 to-cyan-500",
    //   progressRequired: 0,
    // },
    // {
    //   title: "Student ID Card",
    //   description: "Digital student identification card",
    //   icon: <UserCheck />,
    //   unlocked: progress >= 0,
    //   gradient: "from-indigo-500 to-purple-500",
    //   progressRequired: 0,
    // },
    {
      title: "Project Progress Certificate",
      description: "Certificate for reaching 75% project completion",
      icon: <BadgeCheck />,
      unlocked: progress >= 75,
      gradient: "from-emerald-500 to-green-500",
      progressRequired: 75,
    },
    {
      title: "Project Completion Certificate",
      description: "Official certificate of project completion",
      icon: <Trophy />,
      unlocked: progress >= 95,
      gradient: "from-rose-500 to-pink-500",
      progressRequired: 95,
    },
    {
      title: "Letter of Recommendation (LOR)",
      description: "Personalized recommendation from mentors",
      icon: <Award />,
      unlocked: progress >= 100 && lorUnlocked,
      gradient: "from-amber-500 to-orange-500",
      progressRequired: 100,
      isLor: true, // Special flag for LOR logic handling
    },
    // {
    //   title: "Experience Letter",
    //   description: "Professional experience certificate",
    //   icon: <Briefcase />,
    //   unlocked: progress >= 100,
    //   gradient: "from-violet-500 to-purple-500",
    //   progressRequired: 100,
    // },
  ];

  const actionItem = {
    title: "Apply for Job / HR Interview",
    description: "Get placed with our hiring partners",
    icon: <GraduationCap />,
    unlocked: progress >= 100,
    gradient: "from-cyan-600 to-teal-500",
    progressRequired: 100,
    isAction: true,
  };

  const unlockedCount = documents.filter((doc) => doc.unlocked).length;

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="inline" size={24} />
                Documents & Certificates
              </h1>
              <p className="text-cyan-100 max-w-2xl">
                Your documents unlock automatically as you progress through your
                project. Complete milestones to earn certificates and
                recognition.
              </p>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 md:mt-0"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-sm text-cyan-100 mb-1">
                  Overall Progress
                </div>
                <div className="text-2xl font-bold">{progress}%</div>
                <div className="w-40 bg-white/30 rounded-full h-2 mt-2 mx-auto">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1 }}
                    className="bg-gradient-to-r from-white to-cyan-200 h-2 rounded-full"
                  ></motion.div>
                </div>
                <div className="text-xs text-cyan-200 mt-2">
                  {unlockedCount} of {documents.length} documents unlocked
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Target size={24} className="text-cyan-600" />
              Milestone Progress
            </h2>
            <span className="text-sm font-medium text-gray-600">
              Next:{" "}
              {progress < 50
                ? "50%"
                : progress < 75
                  ? "75%"
                  : progress < 100
                    ? "100%"
                    : "Complete!"}
            </span>
          </div>

          <div className="relative h-24 mb-6">
            <div className="flex items-center justify-between h-full absolute w-full z-10 p-0 pointer-events-none">
              {[0, 50, 75, 95, 100].map((milestone) => (
                <div
                  key={milestone}
                  className="absolute transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${milestone}%` }}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${progress >= milestone
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-110"
                      : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    {milestone === 0 && <FileText size={20} />}
                    {milestone === 50 && <BadgeCheck size={20} />}
                    {milestone === 75 && <CheckCircle size={20} />}
                    {milestone === 95 && <Trophy size={20} />}
                    {milestone === 100 && <Award size={20} />}
                  </div>
                  <div
                    className={`text-sm font-medium transition-colors duration-500 ${progress >= milestone ? "text-green-600" : "text-gray-500"
                      }`}
                  >
                    {milestone}%
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full z-0"></div>
            <div
              className="absolute top-6 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full z-0 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>

            <div className="absolute top-6 left-0 right-0 h-1 z-0">
              {[0, 50, 75, 95, 100].map((milestone) => (
                <div
                  key={milestone}
                  className={`absolute w-4 h-4 rounded-full border-2 border-white transform -translate-y-1.5 -translate-x-1/2 transition-all duration-500 ${progress >= milestone
                    ? "bg-green-500 scale-100"
                    : "bg-gray-300 scale-75"
                    }`}
                  style={{ left: `${milestone}%` }}
                ></div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300
                ${doc.unlocked
                  ? "bg-white border-2 border-transparent hover:border-cyan-200"
                  : "bg-gradient-to-br from-gray-50 to-gray-100"
                }`}
            >
              {/* Corner Ribbon for Locked */}
              {!doc.unlocked && (
                <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden z-20">
                  <div className="absolute top-2 -right-8 w-32 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs font-bold py-1 text-center transform rotate-45 shadow-sm">
                    <Lock size={10} className="inline mr-1" /> LOCKED
                  </div>
                </div>
              )}

              {/* Special Locked LOR Overlay */}
              {!doc.unlocked && doc.isLor && progress >= 100 && (
                <div className="absolute inset-0 bg-amber-50/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 transition-all">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 shadow-inner animate-pulse">
                    <Lock className="text-amber-600" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Verification Required</h3>
                  <p className="text-amber-800 text-sm font-medium mb-4 leading-relaxed">
                    Visit the company office to unlock the certification and stamp.
                  </p>
                  <div className="text-xs font-semibold text-amber-700 bg-amber-100 px-4 py-1.5 rounded-full border border-amber-200">
                    Pending Admin Approval
                  </div>
                </div>
              )}

              {/* Shine Effect for Unlocked */}
              {doc.unlocked && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
              )}

              <div className="p-6">
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg
                  ${doc.unlocked
                      ? `bg-gradient-to-r ${doc.gradient} text-white`
                      : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500"
                    }`}
                >
                  {React.cloneElement(doc.icon, { size: 28 })}
                </div>

                {/* Title & Description */}
                <h3
                  className={`text-xl font-bold mb-2 ${doc.unlocked ? "text-gray-800" : "text-gray-600"}`}
                >
                  {doc.title}
                </h3>
                <p
                  className={`text-sm mb-4 ${doc.unlocked ? "text-gray-600" : "text-gray-500"}`}
                >
                  {doc.description}
                </p>

                {/* Status Badge */}
                <div className="mb-5">
                  {doc.unlocked ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      <CheckCircle size={14} /> Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
                      <Lock size={14} /> Requires {doc.progressRequired}%
                      progress
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress Required</span>
                    <span>{doc.progressRequired}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, (progress / doc.progressRequired) * 100)}%`,
                      }}
                      transition={{ duration: 1 }}
                      className={`h-2 rounded-full ${progress >= doc.progressRequired
                        ? `bg-gradient-to-r ${doc.gradient}`
                        : "bg-gradient-to-r from-gray-400 to-gray-500"
                        }`}
                    ></motion.div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  {doc.unlocked ? (
                    <button
                      onClick={() => handleDownloadClick(doc)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <Download size={18} />
                      Download Certificate
                      <ChevronRight size={18} />
                    </button>
                  ) : (
                    <div className="text-center py-3 px-4 rounded-xl bg-gray-100 text-gray-600 text-sm">
                      <Clock size={14} className="inline mr-2" />
                      Available at {doc.progressRequired}% progress
                    </div>
                  )}
                </div>
              </div>

              {/* Glow Effect */}
              {doc.unlocked && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
              )}
            </motion.div>
          ))}

          {/* Special Action Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: documents.length * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300
              ${actionItem.unlocked
                ? "bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-200"
                : "bg-gradient-to-br from-gray-50 to-gray-100"
              }`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
              <div className="absolute top-2 -right-8 w-32 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold py-1 text-center transform rotate-45">
                <Star size={10} className="inline mr-1" /> SPECIAL
              </div>
            </div>

            <div className="p-6">
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg
                ${actionItem.unlocked
                    ? `bg-gradient-to-r ${actionItem.gradient} text-white`
                    : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500"
                  }`}
              >
                {React.cloneElement(actionItem.icon, { size: 28 })}
              </div>

              {/* Title & Description */}
              <h3
                className={`text-xl font-bold mb-2 ${actionItem.unlocked ? "text-gray-800" : "text-gray-600"}`}
              >
                {actionItem.title}
              </h3>
              <p
                className={`text-sm mb-4 ${actionItem.unlocked ? "text-gray-600" : "text-gray-500"}`}
              >
                {actionItem.description}
              </p>

              {/* Status Badge */}
              <div className="mb-5">
                {actionItem.unlocked ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium">
                    <Sparkles size={14} /> Ready to Apply
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
                    <Lock size={14} /> Requires 100% project completion
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress Required</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, progress)}%` }}
                    transition={{ duration: 1 }}
                    className={`h-2 rounded-full ${progress >= 100
                      ? `bg-gradient-to-r ${actionItem.gradient}`
                      : "bg-gradient-to-r from-gray-400 to-gray-500"
                      }`}
                  ></motion.div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4">
                {actionItem.unlocked ? (
                  <button
                    onClick={() =>
                      window.open("https://forms.gle/HALjpNjeTixLa1q89", "_blank")
                    }
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <ExternalLink size={18} />
                    Start Application Process
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <div className="text-center py-3 px-4 rounded-xl bg-gray-100 text-gray-600 text-sm">
                    Complete your project to unlock job opportunities
                  </div>
                )}
              </div>
            </div>

            {/* Animated Dots */}
            {actionItem.unlocked && (
              <div className="absolute bottom-2 right-2">
                <div className="flex space-x-1">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    ></motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Award className="text-indigo-600" />
                Certificate Achievement Summary
              </h3>
              <p className="text-gray-600">
                You have unlocked{" "}
                <span className="font-bold text-indigo-600">
                  {unlockedCount} of {documents.length}
                </span>{" "}
                certificates.
                {progress < 100
                  ? ` Complete your project to unlock all certificates and job opportunities!`
                  : " Congratulations! You've unlocked all certificates!"}
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {unlockedCount}
                </div>
                <div className="text-sm text-gray-600">Unlocked</div>
              </div>
              <div className="h-12 w-px bg-indigo-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {documents.length - unlockedCount}
                </div>
                <div className="text-sm text-gray-600">Locked</div>
              </div>
              <div className="h-12 w-px bg-indigo-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {progress}%
                </div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Certificate Name Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Trophy size={24} />
                Get Your Certificate
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Please confirm the name you want to appear on your{" "}
                <span className="font-semibold text-green-700">
                  {selectedCertificate?.title}
                </span>
                .
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={certificateName}
                    onChange={(e) => setCertificateName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* 🆕 Domain Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain Name
                  </label>
                  <input
                    type="text"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    placeholder="e.g. Web Development"
                  />
                </div>

                {/* 🆕 Duration Input (Only for Completion Certificate) */}
                {selectedCertificate?.title === "Project Completion Certificate" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="e.g. 3-month"
                    />
                  </div>
                )}

                {/* 🆕 Start/End Date Inputs (Only for LOR) */}
                {selectedCertificate?.title === "Letter of Recommendation (LOR)" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateCertificate}
                    disabled={
                      loading ||
                      !certificateName.trim() ||
                      !domainName.trim() ||
                      (selectedCertificate?.title === "Project Completion Certificate" && !duration.trim())
                    }
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium shadow-md transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </StudentLayout>
  );
};

export default Certificates;
