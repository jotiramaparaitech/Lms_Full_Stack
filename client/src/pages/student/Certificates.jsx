import StudentLayout from "../../components/student/StudentLayout";
import { Lock } from "lucide-react";

const Certificates = () => {
  // change this value later from backend
  const isProjectCompleted = false; // true => unlocked

  return (
    <StudentLayout>
      <h1 className="text-2xl font-bold mb-6">Certificates</h1>

      <div className="relative max-w-3xl mx-auto">
        {/* Certificate Image */}
        <img
          src="https://res.cloudinary.com/dl6gein4f/image/upload/v1768657556/APARAITECH_certificate_1__page-0001_wct0ol.jpg"
          alt="Certificate"
          className={`w-full rounded-xl shadow-lg transition-all duration-300
            ${!isProjectCompleted ? "blur-md opacity-70" : ""}`}
        />

        {/* Lock Overlay */}
        {!isProjectCompleted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-xl text-white">
            <Lock size={48} className="mb-3" />
            <p className="text-lg font-semibold">
              Certificate Locked
            </p>
            <p className="text-sm mt-1">
              Complete 100% project to unlock
            </p>
          </div>
        )}

        {/* Unlock Message */}
        {isProjectCompleted && (
          <div className="mt-4 text-center text-green-600 font-semibold">
            🎉 Certificate Unlocked! Congratulations
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default Certificates;
