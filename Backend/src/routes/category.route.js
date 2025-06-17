import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
	getAllCategories,
	createCategory,
	updateCategory,
	deleteCategory,
} from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.get("/", authorize, getAllCategories);
categoryRouter.post("/", authorize, apiLimiter, createCategory);
categoryRouter.put("/:id", authorize, apiLimiter, updateCategory);
categoryRouter.delete("/:id", authorize, apiLimiter, deleteCategory);

export default categoryRouter;
