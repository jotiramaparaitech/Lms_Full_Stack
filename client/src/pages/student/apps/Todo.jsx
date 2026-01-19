import { useContext, useEffect, useState, useRef } from "react";
import StudentLayout from "../../../components/student/StudentLayout";
import { AppContext } from "../../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Filter,
  Search,
  Clock,
  AlertCircle,
  Star,
  CheckSquare,
  Tag,
  CalendarDays,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Todo = () => {
  const { backendUrl, getToken } = useContext(AppContext);

  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDueDate, setEditDueDate] = useState("");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [categories] = useState(["personal", "work", "study", "other"]);
  
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showTodoDetails, setShowTodoDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const editInputRef = useRef(null);

  // ✅ Fetch todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const res = await axios.get(`${backendUrl}/api/todo/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setTodos(res.data.todos);
        calculateStats(res.data.todos);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate statistics
  const calculateStats = (todoList) => {
    const total = todoList.length;
    const completed = todoList.filter(todo => todo.isCompleted).length;
    const pending = total - completed;
    const highPriority = todoList.filter(todo => todo.priority === "high").length;

    setStats({ total, completed, pending, highPriority });
  };

  // ✅ Add Todo
  const addTodo = async () => {
    try {
      if (!title.trim()) {
        toast.error("Enter task title");
        return;
      }

      const token = await getToken();
      const todoData = {
        title,
        description,
        priority,
        dueDate: dueDate || null,
        category: category === "all" ? "personal" : category
      };

      const res = await axios.post(
        `${backendUrl}/api/todo/add`,
        todoData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Task Added ✅");
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDueDate("");
        setCategory("all");
        setShowAddModal(false);
        fetchTodos();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to add task");
    }
  };

  // ✅ Toggle Todo
  const toggleTodo = async (id) => {
    try {
      const token = await getToken();

      const res = await axios.patch(
        `${backendUrl}/api/todo/toggle/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Task updated");
        fetchTodos();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update task");
    }
  };

  // ✅ Delete Todo
  const deleteTodo = async (id) => {
    try {
      const token = await getToken();

      const res = await axios.delete(`${backendUrl}/api/todo/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success("Task Deleted 🗑️");
        fetchTodos();
        setShowTodoDetails(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete task");
    }
  };

  // ✅ Update Todo
  const updateTodo = async (id) => {
    try {
      if (!editTitle.trim()) {
        toast.error("Enter task title");
        return;
      }

      const token = await getToken();
      const updateData = {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        dueDate: editDueDate || null
      };

      const res = await axios.put(
        `${backendUrl}/api/todo/update/${id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Task Updated ✏️");
        setEditingId(null);
        fetchTodos();
        setShowTodoDetails(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update task");
    }
  };

  // ✅ Start editing
  const startEditing = (todo) => {
    setEditingId(todo._id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setEditPriority(todo.priority || "medium");
    setEditDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : "");
    
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 100);
  };

  // ✅ Toggle favorite
  const toggleFavorite = async (id, currentStatus) => {
    try {
      const token = await getToken();

      const res = await axios.patch(
        `${backendUrl}/api/todo/favorite/${id}`,
        { isFavorite: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        fetchTodos();
      }
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  // ✅ Filter and sort todos
  useEffect(() => {
    let result = [...todos];

    // Search filter
    if (searchQuery) {
      result = result.filter(todo =>
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (filter === "active") {
      result = result.filter(todo => !todo.isCompleted);
    } else if (filter === "completed") {
      result = result.filter(todo => todo.isCompleted);
    } else if (filter === "high") {
      result = result.filter(todo => todo.priority === "high");
    } else if (filter === "favorite") {
      result = result.filter(todo => todo.isFavorite);
    }

    // Category filter
    if (category !== "all") {
      result = result.filter(todo => todo.category === category);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === "priority") {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority || "medium"] - priorityOrder[b.priority || "medium"];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredTodos(result);
  }, [todos, searchQuery, filter, sortBy, category]);

  // ✅ Calculate due date status
  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "overdue";
    if (diffDays === 0) return "today";
    if (diffDays <= 3) return "soon";
    return "future";
  };

  // ✅ Priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // ✅ Show todo details
  const showDetails = (todo) => {
    setSelectedTodo(todo);
    setShowTodoDetails(true);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Todo List</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Stay organized and track your daily tasks
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span className="text-sm sm:text-base">Add New Task</span>
          </button>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Tasks</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.total}
                </h3>
              </div>
              <div className="p-2 sm:p-3 bg-cyan-100 rounded-lg sm:rounded-xl">
                <CheckSquare className="text-cyan-600 size-4 sm:size-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Completed</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mt-1 sm:mt-2">
                  {stats.completed}
                </h3>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl">
                <CheckCircle2 className="text-green-600 size-4 sm:size-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Pending</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600 mt-1 sm:mt-2">
                  {stats.pending}
                </h3>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg sm:rounded-xl">
                <Clock className="text-yellow-600 size-4 sm:size-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">High Priority</p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mt-1 sm:mt-2">
                  {stats.highPriority}
                </h3>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg sm:rounded-xl">
                <AlertCircle className="text-red-600 size-4 sm:size-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search - Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Filter size={18} />
              <span className="font-medium">Filters & Search</span>
            </div>
            {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <div className={`${showFilters ? 'block' : 'hidden md:block'}`}>
            {/* Search Bar */}
            <div className="relative mb-4 sm:mb-6">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 size-4 sm:size-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="all">All Tasks</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="high">High Priority</option>
                  <option value="favorite">Favorites</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="capitalize">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="createdAt">Newest</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Todo List - Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-cyan-600"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600">Loading your tasks...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mb-4">
                <CheckSquare className="text-gray-400 size-6 sm:size-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {searchQuery ? "Try a different search term" : "Start by adding your first task"}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
              >
                Create Your First Task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTodos.map((todo) => (
                <div 
                  key={todo._id} 
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => showDetails(todo)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Checkbox - Responsive */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTodo(todo._id);
                      }}
                      className="mt-0.5 sm:mt-1 flex-shrink-0"
                    >
                      {todo.isCompleted ? (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="text-white size-3 sm:size-4" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-300 rounded-full hover:border-cyan-500 transition-colors"></div>
                      )}
                    </button>

                    {/* Content - Responsive */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
                        <div className="flex-1 min-w-0">
                          {editingId === todo._id ? (
                            <div className="space-y-2 sm:space-y-3">
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="text-base sm:text-lg font-semibold border-b border-gray-300 focus:outline-none focus:border-cyan-500 w-full"
                                onKeyPress={(e) => e.key === 'Enter' && updateTodo(todo._id)}
                              />
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="text-sm sm:text-base text-gray-600 border-b border-gray-300 focus:outline-none focus:border-cyan-500 w-full"
                                rows="2"
                                placeholder="Add description..."
                              />
                              <div className="flex flex-wrap items-center gap-2">
                                <select
                                  value={editPriority}
                                  onChange={(e) => setEditPriority(e.target.value)}
                                  className="text-xs sm:text-sm border rounded-lg px-2 sm:px-3 py-1"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                                <input
                                  type="date"
                                  value={editDueDate}
                                  onChange={(e) => setEditDueDate(e.target.value)}
                                  className="text-xs sm:text-sm border rounded-lg px-2 sm:px-3 py-1"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateTodo(todo._id)}
                                    className="px-3 sm:px-4 py-1 bg-cyan-600 text-white text-xs sm:text-sm rounded-lg hover:bg-cyan-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="px-3 sm:px-4 py-1 bg-gray-200 text-gray-700 text-xs sm:text-sm rounded-lg hover:bg-gray-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className={`text-base sm:text-lg font-semibold ${todo.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'} break-words`}>
                                {todo.title}
                              </h3>
                              {todo.description && (
                                <p className="text-sm sm:text-base text-gray-600 mt-1 break-words">{todo.description}</p>
                              )}
                            </>
                          )}
                        </div>

                        {/* Actions - Responsive with smaller icons */}
                        {editingId !== todo._id && (
                          <div className="flex items-center justify-end sm:justify-start gap-1 sm:gap-2 mt-2 sm:mt-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(todo._id, todo.isFavorite);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Star 
                                size={16} 
                                className={`${todo.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} 
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(todo);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} className="text-gray-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Delete this task?")) {
                                  deleteTodo(todo._id);
                                }
                              }}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Tags and Info - Responsive with smaller icons */}
                      {editingId !== todo._id && (
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium rounded-full border ${getPriorityColor(todo.priority)}`}>
                            {todo.priority || "medium"}
                          </span>
                          
                          {todo.category && (
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200 flex items-center gap-1">
                              <Tag size={10} />
                              <span className="hidden sm:inline">{todo.category}</span>
                              <span className="sm:hidden">{todo.category.substring(0, 3)}</span>
                            </span>
                          )}
                          
                          {todo.dueDate && (
                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs rounded-full border flex items-center gap-1 ${
                              getDueDateStatus(todo.dueDate) === 'overdue' 
                                ? 'bg-red-100 text-red-800 border-red-200' 
                                : getDueDateStatus(todo.dueDate) === 'today'
                                ? 'bg-orange-100 text-orange-800 border-orange-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}>
                              <CalendarDays size={10} />
                              <span className="hidden sm:inline">{formatDate(todo.dueDate)}</span>
                              <span className="sm:hidden">
                                {getDueDateStatus(todo.dueDate) === 'overdue' ? 'Overdue' : 
                                 getDueDateStatus(todo.dueDate) === 'today' ? 'Today' : 
                                 formatDate(todo.dueDate).split(' ')[0]}
                              </span>
                            </span>
                          )}
                          
                          <span className="text-xs text-gray-500 hidden sm:inline">
                            Created: {new Date(todo.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Task Modal - Responsive */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Add New Task</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details..."
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="capitalize">
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-medium rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addTodo}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-600 to-teal-500 text-white font-medium rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Todo Details Modal - Responsive */}
        {showTodoDetails && selectedTodo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Task Details</h3>
                <button
                  onClick={() => setShowTodoDetails(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
                  <div className="flex-1">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {selectedTodo.title}
                    </h4>
                    {selectedTodo.description && (
                      <p className="text-sm sm:text-base text-gray-600 mt-2 break-words">
                        {selectedTodo.description}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getPriorityColor(selectedTodo.priority)} self-start`}>
                    {selectedTodo.priority || "medium"} Priority
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <p className="text-xs sm:text-sm text-gray-600">Status</p>
                    <p className={`font-semibold text-sm sm:text-base ${selectedTodo.isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedTodo.isCompleted ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <p className="text-xs sm:text-sm text-gray-600">Category</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900 capitalize">
                      {selectedTodo.category || 'Uncategorized'}
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <p className="text-xs sm:text-sm text-gray-600">Due Date</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">
                      {selectedTodo.dueDate ? formatDate(selectedTodo.dueDate) : 'No due date'}
                      {getDueDateStatus(selectedTodo.dueDate) === 'overdue' && (
                        <span className="text-red-600 ml-1 sm:ml-2">(Overdue)</span>
                      )}
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                    <p className="text-xs sm:text-sm text-gray-600">Created</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-900">
                      {new Date(selectedTodo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    onClick={() => toggleTodo(selectedTodo._id)}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                  >
                    {selectedTodo.isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                  </button>
                  <button
                    onClick={() => {
                      setShowTodoDetails(false);
                      startEditing(selectedTodo);
                    }}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                  >
                    Edit Task
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this task?")) {
                        deleteTodo(selectedTodo._id);
                      }
                    }}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </StudentLayout>
  );
};

export default Todo;