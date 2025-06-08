import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "./token.service.js";
import { sendVerificationEmail } from "./email.service.js";

export const createUser = async (userData) => {
	const { username, email, password, confirm_password } = userData;
	// check if user already exists
	const existingUser = await User.findOne({ email });
	if (existingUser) {
		const error = new Error("User already exists");
		error.statusCode = 409;
		throw error;
	}

	// check if password is too short
	if (password.length < 6) {
		const error = new Error("Password can't be shorter than 6 characters");
		error.statusCode = 400;
		throw error;
	}

	// check if confirmation doesn't match
	if (!confirm_password || password !== confirm_password) {
		const error = new Error("Confirm password doesn't match");
		error.statusCode = 400;
		throw error;
	}

	// Generate verification token
	const { token: verificationToken, expires: verificationTokenExpires } =
		generateVerificationToken();

	// Hash password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	// Create new user
	const newUser = await User.create({
		username,
		email,
		password: hashedPassword,
		verificationToken,
		verificationTokenExpires,
	});

	// Send verification email
	await sendVerificationEmail(email, verificationToken);

	return newUser;
};

export const findUserByEmail = async (email) => {
	const user = await User.findOne({ email });
	if (!user) {
		const error = new Error("User not found");
		error.statusCode = 401;
		throw error;
	}
	return user;
};

export const verifyUserPassword = async (user, password) => {
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		const error = new Error("Password is incorrect");
		error.statusCode = 401;
		throw error;
	}
	return true;
};

export const updateUserRefreshToken = async (userId, refreshToken) => {
	const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
	return User.findByIdAndUpdate(
		userId,
		{
			refreshToken,
			refreshTokenExpires: expires,
		},
		{ new: true }
	);
};

export const clearUserRefreshToken = async (userId) => {
	return User.findByIdAndUpdate(
		userId,
		{
			refreshToken: undefined,
			refreshTokenExpires: undefined,
		},
		{ new: true }
	);
};

export const verifyUserEmail = async (token) => {
	const user = await User.findOne({
		verificationToken: token,
		verificationTokenExpires: { $gt: Date.now() },
	});

	if (!user) {
		const error = new Error("Invalid or expired verification token");
		error.statusCode = 400;
		throw error;
	}

	user.isVerified = true;
	user.verificationToken = undefined;
	user.verificationTokenExpires = undefined;
	await user.save();

	return user;
};

export const sanitizeUser = (user) => {
	const sanitized = user.toObject();
	delete sanitized.password;
	delete sanitized.verificationToken;
	delete sanitized.refreshToken;
	return sanitized;
};
