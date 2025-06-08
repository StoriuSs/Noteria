import jwt from "jsonwebtoken";
import crypto from "crypto";

import {
	JWT_SECRET,
	JWT_EXPIRATION,
	JWT_REFRESH_SECRET,
	JWT_REFRESH_EXPIRATION,
} from "../config/env.js";

export const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, JWT_SECRET, {
		expiresIn: JWT_EXPIRATION,
	});

	const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
		expiresIn: JWT_REFRESH_EXPIRATION,
	});

	return { accessToken, refreshToken };
};

export const verifyRefreshToken = (refreshToken) => {
	try {
		return jwt.verify(refreshToken, JWT_REFRESH_SECRET);
	} catch (error) {
		throw new Error("Invalid refresh token");
	}
};

export const generateVerificationToken = () => {
	const token = crypto.randomBytes(32).toString("hex");
	const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
	return { token, expires };
};
