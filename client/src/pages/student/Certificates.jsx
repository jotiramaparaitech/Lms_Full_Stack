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
  WifiOff,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "../../assets/logo.png";
import logoProgress from "../../assets/logo_progress_certificate.png";
import bgProgress from "../../assets/bg_progress_certificate.png";
import headerLine from "../../assets/Progress_header_line.jpg";
import footerLine from "../../assets/Progress_footer_line.jpg";

const Certificates = () => {
  const { teamProgress, fetchMyTeamProgress, userData, lorUnlocked } =
    useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  /* State for certificate */
  const [showModal, setShowModal] = useState(false);
  const [certificateName, setCertificateName] = useState("");
  const [domainName, setDomainName] = useState("");
  const [duration, setDuration] = useState("3-month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [certificateLoading, setCertificateLoading] = useState(false);

  // ✅ Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setError(null);
      if (!teamProgress) {
        fetchMyTeamProgress();
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setError("No internet connection. Please check your network.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [teamProgress]);

  // ✅ Simulate loading progress (YouTube style)
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 5;
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    fetchMyTeamProgress()
      .catch(err => {
        setError(err.message || "Failed to load data");
      })
      .finally(() => {
        setLoading(false);
        setLoadingProgress(100);
      });
  }, []);

  useEffect(() => {
    if (userData) {
      setCertificateName(userData.name || "");
    }
  }, [userData]);

  // Generate random credential ID with format APA + YY + MM + Serial (7000 series)
  const generateCredentialId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const serial = 7000 + (date.getMilliseconds() % 1000);
    return `APA${year}${month}${serial}`;
  };

  const generateCertificate = () => {
    if (!certificateName.trim() || !domainName.trim()) return;

    if (selectedCertificate?.title === "Project Completion Certificate" && !duration.trim()) return;

    if (selectedCertificate?.title === "Project Progress Certificate") {
      generateProgressCertificate();
    } else if (selectedCertificate?.title === "Project Completion Certificate") {
      generateCompletionCertificate();
    } else if (selectedCertificate?.title === "Letter of Recommendation (LOR)") {
      generateLORCertificate();
    } else {
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
    setCertificateLoading(true);
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const [logoBase64, bgBase64, headerBase64, footerBase64] = await Promise.all([
        getBase64ImageFromUrl(logoProgress),
        getBase64ImageFromUrl(bgProgress),
        getBase64ImageFromUrl(headerLine),
        getBase64ImageFromUrl(footerLine)
      ]);

      const credentialId = generateCredentialId();
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, width, height, "F");

      if (headerBase64) {
        try {
          const hWidth = width;
          const hHeight = 35;
          doc.addImage(headerBase64, "JPEG", 0, 0, hWidth, hHeight);
        } catch (e) {
          console.error("Error adding header line:", e);
        }
      }

      if (footerBase64) {
        try {
          doc.setGState(new doc.GState({ opacity: 0.5 }));
          const fWidth = width;
          const fHeight = 35;
          doc.addImage(footerBase64, "JPEG", 0, height - fHeight, fWidth, fHeight);
          doc.setGState(new doc.GState({ opacity: 1.0 }));
        } catch (e) {
          console.error("Error adding footer line:", e);
        }
      }

      if (bgBase64) {
        try {
          doc.setGState(new doc.GState({ opacity: 0.18 }));
          const bgWidth = 180;
          const bgHeight = 100;
          const bgX = (width - bgWidth) / 2;
          const bgY = (height - bgHeight) / 2 + 10;
          doc.addImage(bgBase64, "PNG", bgX, bgY, bgWidth, bgHeight);
          doc.setGState(new doc.GState({ opacity: 1.0 }));
        } catch (e) {
          console.error("Error adding background:", e);
          try { doc.setGState(new doc.GState({ opacity: 1.0 })); } catch (err) { }
        }
      }

      const margin = 3;
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, width, margin, "F");
      doc.rect(0, height - margin, width, margin, "F");
      doc.rect(0, 0, margin, height, "F");
      doc.rect(width - margin, 0, margin, height, "F");

      doc.setDrawColor(88, 188, 206);
      doc.setLineWidth(0.5);
      doc.rect(margin, margin, width - (margin * 2), height - (margin * 2));

      if (logoBase64) {
        try {
          const logoWidth = 35;
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

      doc.setFont("times", "bold");
      doc.setFontSize(42);
      doc.setTextColor(30, 160, 210);
      doc.text("CERTIFICATE", width / 2, 65, { align: "center" });

      doc.setFont("times", "normal");
      doc.setFontSize(32);
      doc.setTextColor(0, 0, 0);
      doc.text(domainName, width / 2, 85, { align: "center" });

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setCharSpace(1);
      doc.setTextColor(80, 80, 80);
      doc.text("PRESENTED TO :", width / 2.1, 100, { align: "center" });

      doc.setFont("times", "normal");
      doc.setFontSize(38);
      doc.setTextColor(0, 0, 0);
      doc.setCharSpace(0);
      doc.text(certificateName, width / 2, 120, { align: "center" });

      doc.setFont("times", "normal");
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      const descLine = "In recognition of successfully reaching the 75% milestone in the Live Project.";
      doc.text(descLine, width / 2, 135, { align: "center" });

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
      setCertificateLoading(false);
    }
  };

  // 🟪 New Completion Certificate Generation (Purple Design)
  const generateCompletionCertificate = () => {
    setCertificateLoading(true);
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const credentialId = generateCredentialId();
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, width, height, "F");

      const sidebarWidth = 25;
      doc.setFillColor(138, 43, 226);
      doc.rect(10, 10, sidebarWidth, height - 20, "F");

      doc.setDrawColor(255, 215, 0);
      doc.setLineWidth(0.3);
      for (let i = 0; i < 5; i++) {
        doc.curveTo(10, 15 + (i * 5), 10 + sidebarWidth, 25 + (i * 5), 10, 35 + (i * 5));
      }
      for (let i = 0; i < 5; i++) {
        doc.curveTo(10, height - 35 - (i * 5), 10 + sidebarWidth, height - 25 - (i * 5), 10, height - 15 - (i * 5));
      }

      const contentX = 10 + sidebarWidth + 15;
      const centerX = contentX + ((width - 20 - sidebarWidth - 15) / 2);

      try {
        doc.setFillColor(220, 220, 220);
        doc.roundedRect(width - 50, 15, 35, 25, 3, 3, "F");
        doc.addImage(logoImg, "PNG", width - 47, 12, 28, 28);
      } catch (e) {}

      doc.setFont("times", "normal");
      doc.setFontSize(45);
      doc.setTextColor(138, 43, 226);
      doc.text("CERTIFICATE", contentX, 50, { align: "left" });

      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.text("OF COMPLETION", contentX, 65, { align: "left" });

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text("PROUDLY PRESENTED TO", contentX, 85, { align: "left" });

      doc.setFont("times", "normal");
      doc.setFontSize(45);
      doc.setTextColor(0, 0, 0);
      doc.text(certificateName, contentX, 105, { align: "left" });

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

      let cursorX = contentX;
      doc.text(text1, cursorX, startWrapY);
      cursorX += doc.getTextWidth(text1);

      doc.setFont("times", "bold");
      doc.text(textBold1, cursorX, startWrapY);
      cursorX += doc.getTextWidth(textBold1);

      doc.setFont("times", "normal");
      doc.text(text2, cursorX, startWrapY);

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

      const signY = height - 40;
      doc.setFont("times", "italic");
      doc.setFontSize(20);
      doc.setTextColor(50, 50, 50);

      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text("Aparaitech Software", contentX, signY + 10);
      doc.setLineWidth(0.5);
      doc.line(contentX - 5, signY + 2, contentX + 40, signY + 2);

      const footerY = height - 20;
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      const dateText = `Date : ${new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}`;
      doc.text(`Credential ID :`, width - 50, footerY - 5);
      doc.text(credentialId, width - 60, footerY);
      doc.text(dateText, width - 60, footerY + 5);

      doc.save(`Completion_Certificate_${certificateName.replace(/\s+/g, "_")}.pdf`);
      setShowModal(false);
    } catch (error) {
      console.error("Error generating completion certificate:", error);
    } finally {
      setCertificateLoading(false);
    }
  };

  // 🟦 Letter of Recommendation (LOR) Generation
  const generateLORCertificate = async () => {
    setCertificateLoading(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const logoBase64 = await getBase64ImageFromUrl(logoImg);

      const credentialId = generateCredentialId();
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, width, height, "F");

      const margin = 5;
      doc.setDrawColor(30, 60, 120);
      doc.setLineWidth(1);
      doc.rect(margin, margin, width - (margin * 2), height - (margin * 2));
      doc.setLineWidth(0.3);
      doc.rect(margin + 1.5, margin + 1.5, width - (margin * 2 + 3), height - (margin * 2 + 3));

      const headerY = 15;
      const logoWidth = 24;
      const logoHeight = 18;

      if (logoBase64) {
        doc.addImage(
          logoBase64,
          "PNG",
          15,
          headerY + 2,
          logoWidth,
          logoHeight
        );
      }

      const headerTextX = 45;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(30, 60, 120);
      doc.text("APARAITECH", headerTextX, headerY + 8);

      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      doc.text("SOFTWARE COMPANY", headerTextX + 1, headerY + 13);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 150);
      doc.text("www.aparaitech.org", headerTextX, headerY + 20);
      doc.setTextColor(50, 50, 50);
      doc.text("info@aparaitechsoftware.org", headerTextX, headerY + 25);

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

      doc.setDrawColor(30, 60, 120);
      doc.setLineWidth(1);
      doc.line(15, headerY + 35, width - 15, headerY + 35);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(30, 60, 120);
      doc.text("LETTER OF RECOMMENDATION", width / 2, 80, { align: "center" });

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

      const dateStr = new Date().toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });
      doc.text(`Date : ${dateStr}`, width - 20, 105, { align: "right" });

      cursorY += 15;
      doc.text("Dear Candidate,", contentX, cursorY);

      cursorY += 10;
      const lineHeight = 6;
      const maxWidth = width - 40;

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

      doc.setFont("times", "bold");
      const pRef = "We strongly recommend the candidate and wish them every success in future endeavors.";
      doc.text(pRef, width / 2, cursorY, { align: "center" });

      const footY = height - 40;

      doc.setFont("times", "bold");
      doc.text("Signature and Designation", contentX, footY);
      doc.setFont("times", "normal");
      doc.text("(Organization Stamp)", contentX + 5, footY + 5);

      const rightX = width - 70;
      doc.setFont("times", "bold");
      doc.text(`Credential ID :`, rightX, footY);
      doc.setFont("times", "normal");
      doc.text(credentialId, rightX + 30, footY);

      doc.setFont("times", "bold");
      doc.text(`Place :`, rightX, footY + 6);
      doc.setFont("times", "normal");
      doc.text("Baramati", rightX + 15, footY + 6);

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
      setCertificateLoading(false);
    }
  };

  const handleDownloadClick = (doc) => {
    setSelectedCertificate(doc);
    setShowModal(true);
  };

  const progress = Number(teamProgress || 0);

  const documents = [
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
      isLor: true,
    },
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

  // YouTube-style skeleton loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
        <div className="h-7 w-3/4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
        <div className="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
        <div className="h-4 w-2/3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
          <div className="h-2 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
        </div>
        <div className="h-10 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl" />
      </div>
    </div>
  );

  // Loading indicator with YouTube-style progress bar
  const LoadingIndicator = () => (
    <StudentLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* YouTube-style top loading bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 via-gray-600 to-red-600"
            initial={{ width: "0%" }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>

        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-6">
          <div className="h-8 w-64 bg-white/30 rounded-lg mb-2 animate-pulse" />
          <div className="h-4 w-96 bg-white/30 rounded animate-pulse" />
        </div>

        {/* Progress overview skeleton */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
          {/* Special action card skeleton */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-100">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-7 w-3/4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
              <div className="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
                <div className="h-2 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded" />
              </div>
              <div className="h-10 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );

  // Error/Offline state
  const ErrorState = ({ message, isOffline }) => (
    <StudentLayout>
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="inline-block p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
            {isOffline ? (
              <WifiOff className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            ) : (
              <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            )}
            
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {isOffline ? "You're offline" : "Something went wrong"}
            </h3>
            
            <p className="text-gray-500 mb-6">
              {message || (isOffline 
                ? "Please check your internet connection and try again." 
                : "We couldn't load your certificates. Please try again.")}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setLoading(true);
                fetchMyTeamProgress().finally(() => setLoading(false));
              }}
              className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    </StudentLayout>
  );

  if (loading) return <LoadingIndicator />;
  if (isOffline) return <ErrorState isOffline={true} />;
  if (error) return <ErrorState message={error} isOffline={false} />;

  return (
    <StudentLayout>
      {/* Add shimmer animation styles */}
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
            background-size: 200% 100%;
          }
        `}
      </style>

      <div className="space-y-6 p-4 md:p-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-4 md:mt-0"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-sm text-cyan-100 mb-1">
                  Overall Progress
                </div>
                <div className="text-2xl font-bold">{progress}%</div>
                <div className="w-40 bg-white/30 rounded-full h-2 mt-2 mx-auto overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-r from-white to-cyan-200 h-2 rounded-full"
                  />
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
          transition={{ delay: 0.1, duration: 0.5 }}
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
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${
                      progress >= milestone
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
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
                    className={`text-sm font-medium ${
                      progress >= milestone ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {milestone}%
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full z-0"></div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-6 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full z-0"
            />

            <div className="absolute top-6 left-0 right-0 h-1 z-0">
              {[0, 50, 75, 95, 100].map((milestone) => (
                <div
                  key={milestone}
                  className={`absolute w-4 h-4 rounded-full border-2 border-white transform -translate-y-1.5 -translate-x-1/2 ${
                    progress >= milestone
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                  style={{ left: `${milestone}%` }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, index) => (
            <motion.div
              key={doc.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -5, 
                scale: 1.02,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
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
                <div className="absolute inset-0 bg-amber-50/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
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
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-shine" />
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
                <h3 className={`text-xl font-bold mb-2 ${doc.unlocked ? "text-gray-800" : "text-gray-600"}`}>
                  {doc.title}
                </h3>
                <p className={`text-sm mb-4 ${doc.unlocked ? "text-gray-600" : "text-gray-500"}`}>
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
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, (progress / doc.progressRequired) * 100)}%`,
                      }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                      className={`h-2 rounded-full ${
                        progress >= doc.progressRequired
                          ? `bg-gradient-to-r ${doc.gradient}`
                          : "bg-gradient-to-r from-gray-400 to-gray-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  {doc.unlocked ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDownloadClick(doc)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <Download size={18} />
                      Download Certificate
                      <ChevronRight size={18} />
                    </motion.button>
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: documents.length * 0.1 + 0.2 }}
            whileHover={{ 
              y: -5, 
              scale: 1.02,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
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
              <h3 className={`text-xl font-bold mb-2 ${actionItem.unlocked ? "text-gray-800" : "text-gray-600"}`}>
                {actionItem.title}
              </h3>
              <p className={`text-sm mb-4 ${actionItem.unlocked ? "text-gray-600" : "text-gray-500"}`}>
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
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, progress)}%` }}
                    transition={{ duration: 0.8, delay: documents.length * 0.1 + 0.4 }}
                    className={`h-2 rounded-full ${
                      progress >= 100
                        ? `bg-gradient-to-r ${actionItem.gradient}`
                        : "bg-gradient-to-r from-gray-400 to-gray-500"
                    }`}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4">
                {actionItem.unlocked ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      window.open("https://forms.gle/HALjpNjeTixLa1q89", "_blank")
                    }
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <ExternalLink size={18} />
                    Start Application Process
                    <ChevronRight size={18} />
                  </motion.button>
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
                    />
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
          transition={{ delay: 0.4, duration: 0.5 }}
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
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Trophy size={24} />
                  Get Your Certificate
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition"
                >
                  <X size={20} />
                </motion.button>
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
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={generateCertificate}
                      disabled={
                        certificateLoading ||
                        !certificateName.trim() ||
                        !domainName.trim() ||
                        (selectedCertificate?.title === "Project Completion Certificate" && !duration.trim())
                      }
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium shadow-md transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {certificateLoading ? (
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
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </StudentLayout>
  );
};

export default Certificates;