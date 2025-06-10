const errorMiddleware = (err, req, res, next) => {
	try {
		let error = { ...err };
		error.message = err.message;
		console.error(err);
		// Mongoose bad ObjectId
		if (err.name === "CastError") {
			const message = `Resource not found. Invalid: ${err.path}`;
			error = new Error(message);
			error.statusCode = 404;
		}
		// Mongoose duplicate key
		if (err.code === 11000) {
			const message = `Duplicate field value entered: ${Object.keys(
				err.keyValue
			).join(", ")}`;
			error = new Error(message);
			error.statusCode = 400;
		}
		// Mongoose validation error
		if (err.name === "ValidationError") {
			const message = Object.values(err.errors)
				.map((val) => val.message)
				.join(", ");
			error = new Error(message);
			error.statusCode = 400;
		}
		// JWT errors (e.g., token expired, invalid signature, no refresh token provided)
		if (
			err.name === "JsonWebTokenError" ||
			err.message === "No refresh token provided" ||
			err.message === "Invalid refresh token"
		) {
			error.statusCode = 401;
			error.message = err.message || "Unauthorized access";
		}

		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Server Error",
		});
	} catch (error) {
		next(error);
	}
};

export default errorMiddleware;
