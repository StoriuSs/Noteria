import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required"],
			trim: true,
			minLength: 2,
			maxLength: 50,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [
				/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
				"Please fill a valid email address",
			],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		verificationToken: String,
		verificationTokenExpires: Date,
		refreshToken: String,
		refreshTokenExpires: Date,
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", userSchema);

export default User;
