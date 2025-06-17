import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import { apiLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
	getCategoryNotes,
	getAllNotes,
	createNote,
	updateNote,
	deleteNote,
	deleteAllNotes,
} from "../controllers/note.controller.js";

const noteRouter = Router();

noteRouter.get(
	"/category/:categoryId",
	authorize,
	apiLimiter,
	getCategoryNotes
);
noteRouter.get("/", authorize, getAllNotes);
noteRouter.post("/", authorize, apiLimiter, createNote);
noteRouter.put("/:id", authorize, apiLimiter, updateNote);
noteRouter.delete("/:id", authorize, apiLimiter, deleteNote);
noteRouter.delete(
	"/category/:categoryId",
	authorize,
	apiLimiter,
	deleteAllNotes
);

export default noteRouter;
