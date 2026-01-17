import StudentLayout from "../../components/student/StudentLayout";

const Progress = () => {
  return (
    <StudentLayout>
      <h1 className="text-2xl font-bold mb-6">Progress</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <p>Overall Course Progress</p>
        <div className="w-full bg-gray-200 h-3 rounded mt-2">
          <div className="bg-cyan-600 h-3 rounded w-[0%]" />
        </div>
        <p className="text-sm text-gray-500 mt-2">0% Completed</p>
      </div>
    </StudentLayout>
  );
};

export default Progress;
