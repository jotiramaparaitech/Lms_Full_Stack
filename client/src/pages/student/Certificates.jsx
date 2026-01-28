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

const Certificates = () => {
  const { teamProgress, fetchMyTeamProgress, userData } =
    useContext(AppContext);

  useEffect(() => {
    fetchMyTeamProgress();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [certificateName, setCertificateName] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setCertificateName(userData.name || "");
    }
  }, [userData]);

  const generateCertificate = () => {
    if (!certificateName.trim()) return;
    setLoading(true);

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Background color
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 297, 210, "F");

      // Decorative Border
      doc.setLineWidth(2);
      doc.setDrawColor(20, 184, 166); // Teal color
      doc.rect(10, 10, 277, 190);

      doc.setLineWidth(1);
      doc.setDrawColor(45, 212, 191); // Light teal
      doc.rect(15, 15, 267, 180);

      // Logo/Header Area
      doc.setFont("helvetica", "bold");
      doc.setFontSize(36);
      doc.setTextColor(13, 148, 136); // Teal-700
      doc.text("CERTIFICATE", 148.5, 50, { align: "center" });

      doc.setFontSize(16);
      doc.setTextColor(80, 80, 80);
      
      const subTitle =
        selectedCertificate?.title === "Project Progress Certificate"
          ? "OF ACHIEVEMENT"
          : "OF COMPLETION";
      doc.text(subTitle, 148.5, 62, { align: "center" });

      // Main Content
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text("This certificate is proudly presented to", 148.5, 90, {
        align: "center",
      });

      // User Name
      doc.setFont("times", "bolditalic");
      doc.setFontSize(40);
      doc.setTextColor(30, 30, 30);
      doc.text(certificateName, 148.5, 115, { align: "center" });

      doc.setLineWidth(0.5);
      doc.setDrawColor(100, 100, 100);
      doc.line(80, 120, 217, 120);

      // Description
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);

      const descLine1 =
        selectedCertificate?.title === "Project Progress Certificate"
          ? "For successfully reaching the 75% milestone in the Full Stack Development Project"
          : "For successfully completing the Full Stack Development Project";

      doc.text(descLine1, 148.5, 140, { align: "center" });
      doc.text(
        "demonstrating exceptional dedication and hard work.",
        148.5,
        150,
        { align: "center" },
      );

      // Signatures
      const date = new Date().toLocaleDateString();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);

      // Date
      doc.text("Date", 60, 175);
      doc.text(date, 60, 185);
      doc.line(40, 187, 100, 187);

      // Signature line
      doc.text("Program Director", 210, 175);
      doc.text("Aparaitech LMS", 210, 185);
      doc.line(190, 187, 250, 187);

      // Save
      doc.save(`Certificate_${certificateName.replace(/\s+/g, "_")}.pdf`);
      setShowModal(false);
    } catch (error) {
      console.error("Error generating certificate:", error);
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
      description: "Certificate for reaching 50% project completion",
      icon: <BadgeCheck />,
      unlocked: progress >= 75,
      gradient: "from-emerald-500 to-green-500",
      progressRequired: 75,
    },
    {
      title: "Project Completion Certificate",
      description: "Official certificate of project completion",
      icon: <Trophy />,
      unlocked: progress >= 100,
      gradient: "from-rose-500 to-pink-500",
      progressRequired: 100,
    },
    {
      title: "Letter of Recommendation (LOR)",
      description: "Personalized recommendation from mentors",
      icon: <Award />,
      unlocked: progress >= 100,
      gradient: "from-amber-500 to-orange-500",
      progressRequired: 100,
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
              {[0, 50, 75, 100].map((milestone) => (
                <div
                  key={milestone}
                  className="absolute transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${milestone}%` }}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${
                      progress >= milestone
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-110"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {milestone === 0 && <FileText size={20} />}
                    {milestone === 50 && <BadgeCheck size={20} />}
                    {milestone === 75 && <Award size={20} />}
                    {milestone === 100 && <Trophy size={20} />}
                  </div>
                  <div
                    className={`text-sm font-medium transition-colors duration-500 ${
                      progress >= milestone ? "text-green-600" : "text-gray-500"
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
               {[0, 50, 75, 100].map((milestone) => (
                  <div
                    key={milestone}
                    className={`absolute w-4 h-4 rounded-full border-2 border-white transform -translate-y-1.5 -translate-x-1/2 transition-all duration-500 ${
                       progress >= milestone
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
                ${
                  doc.unlocked
                    ? "bg-white border-2 border-transparent hover:border-cyan-200"
                    : "bg-gradient-to-br from-gray-50 to-gray-100"
                }`}
            >
              {/* Corner Ribbon for Locked */}
              {!doc.unlocked && (
                <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                  <div className="absolute top-2 -right-8 w-32 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs font-bold py-1 text-center transform rotate-45">
                    <Lock size={10} className="inline mr-1" /> LOCKED
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
                  ${
                    doc.unlocked
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
                      className={`h-2 rounded-full ${
                        progress >= doc.progressRequired
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
              ${
                actionItem.unlocked
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
                ${
                  actionItem.unlocked
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
                    className={`h-2 rounded-full ${
                      progress >= 100
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
                      window.open("https://docs.google.com/forms/d/e/1FAIpQLSfk1OdxBCZHkhcIYWKZsdm2MRQuH08KQefDbBRNXZxKFlxgpw/viewform?usp=publish-editor", "_blank")
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

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateCertificate}
                    disabled={loading || !certificateName.trim()}
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
