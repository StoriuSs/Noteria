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

export const sendTaskReminderEmail = async (userEmail, task) => {
	const mailOptions = {
		from: EMAIL_USER,
		to: userEmail,
		subject: `Noteria Task Reminder`,
		html: `
      <h1>Task Reminder</h1>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">${task.title}</h2>
        ${
			task.description
				? `<p style="color: #666; margin: 10px 0;"><strong>Description:</strong> ${task.description}</p>`
				: ""
		}
        <p style="color: #666; margin: 10px 0;"><strong>Priority:</strong> <span style="color: ${getPriorityColor(
			task.priority
		)}; font-weight: bold;">${task.priority.toUpperCase()}</span></p>
        ${
			task.dueDate
				? `<p style="color: #666; margin: 10px 0;"><strong>Due Date:</strong> ${new Date(
						task.dueDate
				  ).toLocaleString()}</p>`
				: ""
		}
        ${
			task.subtasks && task.subtasks.length > 0
				? `
          <div style="margin: 15px 0;">
            <strong>Subtasks:</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
              ${task.subtasks
					.map(
						(subtask) => `
                <li style="color: ${
					subtask.completed ? "#28a745" : "#666"
				}; text-decoration: ${
							subtask.completed ? "line-through" : "none"
						};">
                  ${subtask.title} ${subtask.completed ? "✓" : ""}
                </li>
              `
					)
					.join("")}
            </ul>
          </div>
        `
				: ""
		}
      </div>
      <p style="color: #666;">This is an automated reminder for your task. Please update the task in Noteria if you changed your mind.</p>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(
			`Task reminder email sent to ${userEmail} for task: ${task.title}`
		);
	} catch (error) {
		console.error("Error sending task reminder email:", error);
		throw new Error("Failed to send task reminder email");
	}
};

// Helper function to get priority color
const getPriorityColor = (priority) => {
	switch (priority) {
		case "high":
			return "#dc3545";
		case "medium":
			return "#ffc107";
		case "low":
			return "#28a745";
		default:
			return "#666";
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
