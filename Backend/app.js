import express from "express";
import morgan from "morgan";
import cors from "cors";
import { PORT } from "./src/config/env.js";
import connectDB from "./src/config/database.js";

import authRouter from "./src/routes/auth.route.js";
import categoryRouter from "./src/routes/category.route.js";
import noteRouter from "./src/routes/note.route.js";
import taskRouter from "./src/routes/task.route.js";

import errorMiddleware from "./src/middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import { startCleanupJob } from "./src/services/cleanup.service.js";
import { loadExistingReminders } from "./src/services/reminder.service.js";

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Start scheduled cleanup job
startCleanupJob();

// Load existing task reminders
loadExistingReminders();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);
app.use(cookieParser());

// Route
app.get("/", (req, res) => {
	res.json({ message: "Welcome to Noteria API" });
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/tasks", taskRouter);
// Error handling middleware
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
