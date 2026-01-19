import Todo from "../models/Todo.js";

// ✅ Add Task
export const addTodo = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    const { title, description, priority, category, dueDate } = req.body;

    if (!title) {
      return res.json({ success: false, message: "Title is required" });
    }

    const todo = await Todo.create({
      userId,
      title,
      description: description || "",
      priority: priority || "medium",
      category: category || "personal",
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    res.json({ success: true, message: "Task Added", todo });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get My Todos
export const getMyTodos = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    const todos = await Todo.find({ userId }).sort({ createdAt: -1 });

    res.json({ success: true, todos });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ Toggle Complete
export const toggleTodo = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;
    const { id } = req.params;

    const todo = await Todo.findOne({ _id: id, userId });

    if (!todo) {
      return res.json({ success: false, message: "Task not found" });
    }

    todo.isCompleted = !todo.isCompleted;
    await todo.save();

    res.json({ success: true, message: "Task Updated", todo });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ Delete Todo
export const deleteTodo = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({ _id: id, userId });

    if (!todo) {
      return res.json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Task Deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ Update Todo (For Edit Feature)
export const updateTodo = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;
    const { id } = req.params;

    const { title, description, priority, dueDate, category } = req.body;

    const todo = await Todo.findOne({ _id: id, userId });

    if (!todo) {
      return res.json({ success: false, message: "Task not found" });
    }

    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (priority !== undefined) todo.priority = priority;
    if (category !== undefined) todo.category = category;
    if (dueDate !== undefined) todo.dueDate = dueDate ? new Date(dueDate) : null;

    await todo.save();

    res.json({ success: true, message: "Task Updated", todo });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ Toggle Favorite
export const toggleFavorite = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;
    const { id } = req.params;

    const { isFavorite } = req.body;

    const todo = await Todo.findOne({ _id: id, userId });

    if (!todo) {
      return res.json({ success: false, message: "Task not found" });
    }

    todo.isFavorite = Boolean(isFavorite);
    await todo.save();

    res.json({ success: true, message: "Favorite Updated", todo });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
