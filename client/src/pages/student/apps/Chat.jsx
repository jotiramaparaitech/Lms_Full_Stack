import StudentLayout from "../../../components/student/StudentLayout";



const Chat = () => {
  return (
    <StudentLayout>
      <h1 className="text-2xl font-bold mb-6">Chat</h1>
      
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            <p className="text-gray-600 mt-1">Communicate with classmates and educators</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity">
            New Message
          </button>
        </div>
        
        {/* Chat content will go here */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg text-center text-gray-500">
          Chat interface will be implemented here
        </div>
      </div>
    </StudentLayout>
  );
};

export default Chat;