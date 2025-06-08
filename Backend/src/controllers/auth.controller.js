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

const signUp = async (req, res, next) => {
	try {
		const newUser = await createUser(req.body);
		const { accessToken, refreshToken } = generateTokens(newUser._id);

		await updateUserRefreshToken(newUser._id, refreshToken);

		res.status(201).json({
			success: true,
			message:
				"User created successfully. Please check your email to verify your account.",
			data: {
				accessToken,
				refreshToken,
				user: sanitizeUser(newUser),
			},
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

		res.status(200).json({
			success: true,
			message: "User signed in successfully",
			data: {
				accessToken,
				refreshToken,
				user: sanitizeUser(user),
			},
		});
	} catch (error) {
		next(error);
	}
};

const verifyEmail = async (req, res, next) => {
	try {
		await verifyUserEmail(req.params.token);
		res.status(200).json({
			success: true,
			message: "Email verified successfully",
		});
	} catch (error) {
		next(error);
	}
};

const refreshToken = async (req, res, next) => {
	try {
		const { refreshToken } = req.body;

		// Verify the refresh token
		const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

		// Find user and check if refresh token is still valid
		const user = await User.findOne({
			_id: decoded.userId,
			refreshTokenExpires: { $gt: Date.now() },
		});

		if (!user) {
			throw new Error("Invalid refresh token");
		}

		// Generate new access token
		const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
			expiresIn: JWT_EXPIRATION,
		});

		res.json({
			accessToken,
			// Return the same refresh token
			refreshToken,
		});
	} catch (error) {
		next(error);
	}
};

const signOut = async (req, res, next) => {
	try {
		await clearUserRefreshToken(req.user._id);
		res.status(200).json({
			success: true,
			message: "Successfully signed out",
		});
	} catch (error) {
		next(error);
	}
};

export { signUp, signIn, signOut, verifyEmail, refreshToken };
