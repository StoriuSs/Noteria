import rateLimit from "express-rate-limit";
import ms from "ms";

const authLimiter = rateLimit({
	windowMs: ms("10m"),
	max: 10, // 10 attempts
	message: {
		success: false,
		message: "Too many attempts, please try again after 10 minutes",
	},
});

const apiLimiter = rateLimit({
	windowMs: ms("1m"),
	max: 500, // 500 requests per minute
	message: {
		success: false,
		message: "Too many requests, please try again later",
	},
});

export { authLimiter, apiLimiter };
