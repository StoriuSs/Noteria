import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 5, // 5 attempts
	message: {
		success: false,
		message: "Too many attempts, please try again after 15 minutes",
	},
});

const apiLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 50, // 50 requests per minute
	message: {
		success: false,
		message: "Too many requests, please try again later",
	},
});

export { authLimiter, apiLimiter };
