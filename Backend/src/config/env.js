import { config } from "dotenv";

config({ path: ".env" });

export const {
	NODE_ENV,
	PORT,
	MONGODB_URI,
	JWT_SECRET,
	JWT_EXPIRATION,
	FRONTEND_URL,
	JWT_REFRESH_SECRET,
	JWT_REFRESH_EXPIRATION,
	EMAIL_USER,
	EMAIL_PASS,
} = process.env;
