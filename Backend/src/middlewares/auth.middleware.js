import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

const authorize = async (req, res, next) => {
	try {
		let token;
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];
		}

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized access",
			});
		}

		// Verify the token
		const decoded = jwt.verify(token, JWT_SECRET);
		// Find the user by ID from the token
		const user = await User.findById(decoded.userId).select("-password");
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Unauthorized access",
			});
		}

		// Attach user to the request object
		req.user = user;
		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: "Unauthorized access",
			error: error.message,
		});
	}
};

export default authorize;
