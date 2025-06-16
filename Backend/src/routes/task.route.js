import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
	getCategoryTasks,
	getAllTasks,
	createTask,
	updateTask,
	deleteTask,
	deleteAllTasks,
} from "../controllers/task.controller.js";

const taskRouter = Router();

taskRouter.get(
	"/category/:categoryId",
	authorize,
	apiLimiter,
	getCategoryTasks
);
taskRouter.get("/", authorize, apiLimiter, getAllTasks);
taskRouter.post("/", authorize, apiLimiter, createTask);
taskRouter.put("/:id", authorize, apiLimiter, updateTask);
taskRouter.delete("/:id", authorize, apiLimiter, deleteTask);
taskRouter.delete(
	"/category/:categoryId",
	authorize,
	apiLimiter,
	deleteAllTasks
);

export default taskRouter;
