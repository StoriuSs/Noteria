import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS, FRONTEND_URL } from "../config/env.js";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: EMAIL_USER,
		pass: EMAIL_PASS,
	},
});

export const sendVerificationEmail = async (email, token) => {
	const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

	const mailOptions = {
		from: EMAIL_USER,
		to: email,
		subject: "Verify Your Email - Noteria",
		html: `
      <h1>Welcome to Noteria!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error("Error sending verification email:", error);
		throw new Error("Failed to send verification email");
	}
};

// export const sendPasswordResetEmail = async (email, token) => {
//   const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

//   const mailOptions = {
//     from: EMAIL_USER,
//     to: email,
//     subject: 'Reset Your Password - Noteria',
//     html: `
//       <h1>Password Reset Request</h1>
//       <p>Click the link below to reset your password:</p>
//       <a href="${resetUrl}">Reset Password</a>
//       <p>This link will expire in 1 hour.</p>
//       <p>If you didn't request a password reset, you can safely ignore this email.</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error('Error sending password reset email:', error);
//     throw new Error('Failed to send password reset email');
//   }
// };
