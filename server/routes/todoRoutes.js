import express from "express";
import {
  addTodo,
  getMyTodos,
  toggleTodo,
  deleteTodo,
  updateTodo,
  toggleFavorite,
} from "../controllers/todoController.js";

const todoRouter = express.Router();

todoRouter.post("/add", addTodo);
todoRouter.get("/my", getMyTodos);

todoRouter.patch("/toggle/:id", toggleTodo);
todoRouter.patch("/favorite/:id", toggleFavorite);

todoRouter.put("/update/:id", updateTodo);

todoRouter.delete("/delete/:id", deleteTodo);

export default todoRouter;
