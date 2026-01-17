import StudentLayout from "../../components/student/StudentLayout";

const Tests = () => {
  return (
    <StudentLayout>
      <h1 className="text-2xl font-bold mb-6">Tests</h1>

      <div className="space-y-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold">React Basics Test</h3>
          <p className="text-gray-600">Score: 80%</p>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Tests;
