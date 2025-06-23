import {
	createUser,
	findUserByEmail,
	verifyUserPassword,
	updateUserRefreshToken,
	clearUserRefreshToken,
	verifyUserEmail,
	sanitizeUser,
	deleteUserAndData,
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
import bcrypt from "bcryptjs";
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

const deleteAccount = async (req, res, next) => {
	try {
		const userId = req.user._id;
		await deleteUserAndData(userId);
		// Clear the refresh token cookie
		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: NODE_ENV === "production",
			path: "/api/v1/auth/refresh-token",
		});
		res.status(200).json({
			success: true,
			message: "Account and all data deleted.",
		});
	} catch (error) {
		next(error);
	}
};

const updateProfile = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const { username, currentPassword, newPassword } = req.body;
		let updateData = {};

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error("User not found");
			error.statusCode = 404;
			throw error;
		}

		// Update username if provided
		if (username) {
			updateData.username = username;
		}

		// Update password if provided
		if (currentPassword && newPassword) {
			// Verify current password
			const isMatch = await bcrypt.compare(
				currentPassword,
				user.password
			);
			if (!isMatch) {
				const error = new Error("Current password is incorrect");
				error.statusCode = 401;
				throw error;
			}

			// Validate new password
			if (newPassword.length < 6) {
				const error = new Error(
					"New password must be at least 6 characters"
				);
				error.statusCode = 400;
				throw error;
			}

			// Hash the new password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(newPassword, salt);
			updateData.password = hashedPassword;
		}

		// Update the user
		const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
			new: true,
		});

		// Generate new tokens if password was changed
		let responseData = {};
		if (currentPassword && newPassword) {
			const { accessToken, refreshToken: newRefreshToken } =
				generateTokens(userId);
			await updateUserRefreshToken(userId, newRefreshToken);

			// Set refresh token as HTTP-only cookie
			res.cookie("refreshToken", newRefreshToken, {
				httpOnly: true,
				secure: NODE_ENV === "production",
				maxAge: ms(JWT_REFRESH_EXPIRATION),
				path: "/api/v1/auth/refresh-token",
			});

			responseData.accessToken = accessToken;
		}

		responseData.user = sanitizeUser(updatedUser);

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			data: responseData,
		});
	} catch (error) {
		next(error);
	}
};

export {
	signUp,
	signIn,
	signOut,
	verifyEmail,
	refreshToken,
	deleteAccount,
	updateProfile,
};
