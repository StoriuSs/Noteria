import {
	createUser,
	findUserByEmail,
	verifyUserPassword,
	updateUserRefreshToken,
	clearUserRefreshToken,
	verifyUserEmail,
	sanitizeUser,
} from "../services/user.service.js";
import {
	generateTokens,
	verifyRefreshToken,
} from "../services/token.service.js";
import jwt from "jsonwebtoken";
import {
	NODE_ENV,
	JWT_SECRET,
	JWT_EXPIRATION,
	JWT_REFRESH_EXPIRATION,
} from "../config/env.js";
import User from "../models/user.model.js";
import ms from "ms";

const signUp = async (req, res, next) => {
	try {
		await createUser(req.body);

		res.status(201).json({
			success: true,
			message:
				"User created successfully. Please check your email to verify your account.",
		});
	} catch (error) {
		next(error);
	}
};

const signIn = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await findUserByEmail(email);

		if (!user.isVerified) {
			const error = new Error("Please verify your email first");
			error.statusCode = 401;
			throw error;
		}

		await verifyUserPassword(user, password);
		const { accessToken, refreshToken } = generateTokens(user._id);
		await updateUserRefreshToken(user._id, refreshToken);

		// Set refresh token as HTTP-only cookie
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: NODE_ENV === "production",
			sameSite: "strict",
			maxAge: ms(JWT_REFRESH_EXPIRATION),
			path: "/api/v1/auth/refresh-token",
		});

		res.status(200).json({
			success: true,
			message: "User signed in successfully",
			data: {
				accessToken,
				user: sanitizeUser(user),
			},
		});
	} catch (error) {
		next(error);
	}
};

const verifyEmail = async (req, res, next) => {
	try {
		const user = await verifyUserEmail(req.params.token);
		const { accessToken, refreshToken } = generateTokens(user._id);
		await updateUserRefreshToken(user._id, refreshToken);

		// Set refresh token as HTTP-only cookie
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: NODE_ENV === "production",
			maxAge: ms(JWT_REFRESH_EXPIRATION),
			path: "/api/v1/auth/refresh-token",
		});

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			data: {
				accessToken,
				user: sanitizeUser(user),
			},
		});
	} catch (error) {
		next(error);
	}
};

const refreshToken = async (req, res, next) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (!refreshToken) {
			throw new Error("No refresh token provided");
		}

		const decoded = verifyRefreshToken(refreshToken);
		const user = await User.findOne({
			_id: decoded.userId,
			refreshTokenExpires: { $gt: Date.now() },
		});

		if (!user) {
			throw new Error("Invalid refresh token");
		}

		const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
			expiresIn: JWT_EXPIRATION,
		});

		res.json({ accessToken });
	} catch (error) {
		next(error);
	}
};

const signOut = async (req, res, next) => {
	try {
		await clearUserRefreshToken(req.user._id);
		// Clear the refresh token cookie
		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: NODE_ENV === "production",
			path: "/api/v1/auth/refresh-token",
		});
		res.status(200).json({
			success: true,
			message: "Successfully signed out",
		});
	} catch (error) {
		next(error);
	}
};

export { signUp, signIn, signOut, verifyEmail, refreshToken };
