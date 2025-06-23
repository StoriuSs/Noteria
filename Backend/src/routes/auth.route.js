import { Router } from "express";
import {
	signUp,
	signIn,
	signOut,
	verifyEmail,
	refreshToken,
	deleteAccount,
	updateProfile,
	forgotPassword,
	verifyResetToken,
	resetPassword,
} from "../controllers/auth.controller.js";
import authorize from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", authLimiter, signUp);
authRouter.post("/sign-in", authLimiter, signIn);
authRouter.post("/refresh-token", authLimiter, refreshToken);
authRouter.get("/verify-email/:token", authLimiter, verifyEmail);
authRouter.post("/forgot-password", authLimiter, forgotPassword);
authRouter.post("/verify-reset-token", authLimiter, verifyResetToken);
authRouter.post("/reset-password", authLimiter, resetPassword);

authRouter.post("/sign-out", authorize, signOut);
authRouter.delete("/delete-account", authorize, deleteAccount);
authRouter.put("/update-profile", authorize, updateProfile);

export default authRouter;
