import StudentLayout from "../../../components/student/StudentLayout";


const Todo = () => {
  return (
    <StudentLayout>
      <h1 className="text-2xl font-bold mb-6">Todo</h1>
      
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Tasks & Assignments</h2>
            <p className="text-gray-600 mt-1">Track your daily tasks and assignments</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity">
            Add Task
          </button>
        </div>
        
        {/* Todo content will go here */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg text-center text-gray-500">
          Todo list will be implemented here
        </div>
      </div>
    </StudentLayout>
  );
};

export default Todo;