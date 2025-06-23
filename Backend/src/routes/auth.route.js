import { Router } from "express";
import {
	signUp,
	signIn,
	signOut,
	verifyEmail,
	refreshToken,
	deleteAccount,
} from "../controllers/auth.controller.js";
import authorize from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", authLimiter, signUp);
authRouter.post("/sign-in", authLimiter, signIn);
authRouter.post("/refresh-token", authLimiter, refreshToken);
authRouter.get("/verify-email/:token", authLimiter, verifyEmail);
// authorize before signing out
authRouter.post("/sign-out", authorize, signOut);
authRouter.delete("/delete-account", authorize, deleteAccount);

export default authRouter;
