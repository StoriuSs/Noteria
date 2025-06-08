import express from "express";
import morgan from "morgan";
import { PORT } from "./src/config/env.js";
import connectDB from "./src/config/database.js";
import authRouter from "./src/routes/auth.route.js";
import errorMiddleware from "./src/middlewares/error.middleware.js";

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Route
app.get("/", (req, res) => {
	res.json({ message: "Welcome to Noteria API" });
});
app.use("/api/v1/auth", authRouter);

// Error handling middleware
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
