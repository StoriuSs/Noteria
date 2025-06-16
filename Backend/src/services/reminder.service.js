import cron from "node-cron";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { sendTaskReminderEmail } from "./email.service.js";

// Store scheduled jobs for easy management
const scheduledJobs = new Map();

// Schedule a reminder for a specific task
export const scheduleTaskReminder = async (taskId) => {
	try {
		const task = await Task.findById(taskId).populate("userId", "email");

		if (
			!task ||
			!task.hasReminder ||
			task.reminderType !== "email" ||
			!task.reminderTime
		) {
			return;
		}

		// Cancel existing job if any
		cancelTaskReminder(taskId);

		const reminderDate = new Date(task.reminderTime);
		const now = new Date();

		// Don't schedule if reminder time has already passed
		if (reminderDate <= now) {
			return;
		}

		// Create cron expression for the specific date and time
		const cronExpression = `${reminderDate.getMinutes()} ${reminderDate.getHours()} ${reminderDate.getDate()} ${
			reminderDate.getMonth() + 1
		} *`;

		const job = cron.schedule(
			cronExpression,
			async () => {
				try {
					await sendTaskReminderEmail(task.userId.email, task);

					// Remove the job after execution
					scheduledJobs.delete(taskId);

					console.log(`Reminder sent for task: ${task.title}`);
				} catch (error) {
					console.error(
						`Failed to send reminder for task ${taskId}:`,
						error
					);
				}
			},
			{
				scheduled: false,
			}
		);

		// Start the job
		job.start();

		// Store the job for later cancellation
		scheduledJobs.set(taskId, job);

		console.log(
			`Reminder scheduled for task: ${
				task.title
			} at ${reminderDate.toLocaleString()}`
		);
	} catch (error) {
		console.error(`Failed to schedule reminder for task ${taskId}:`, error);
	}
};

// Cancel a scheduled reminder
export const cancelTaskReminder = (taskId) => {
	const job = scheduledJobs.get(taskId);
	if (job) {
		job.stop();
		scheduledJobs.delete(taskId);
		console.log(`Reminder cancelled for task: ${taskId}`);
	}
};

// Load and schedule all existing reminders on server startup
export const loadExistingReminders = async () => {
	try {
		const tasks = await Task.find({
			hasReminder: true,
			reminderType: "email",
			reminderTime: { $gt: new Date() },
		}).populate("userId", "email");

		console.log(`Loading ${tasks.length} existing reminders...`);

		for (const task of tasks) {
			await scheduleTaskReminder(task._id);
		}

		console.log("All existing reminders loaded successfully");
	} catch (error) {
		console.error("Failed to load existing reminders:", error);
	}
};

// Update reminder when task is updated
export const updateTaskReminder = async (taskId) => {
	try {
		const task = await Task.findById(taskId);

		if (!task) {
			cancelTaskReminder(taskId);
			return;
		}

		if (
			task.hasReminder &&
			task.reminderType === "email" &&
			task.reminderTime
		) {
			await scheduleTaskReminder(taskId);
		} else {
			cancelTaskReminder(taskId);
		}
	} catch (error) {
		console.error(`Failed to update reminder for task ${taskId}:`, error);
	}
};

// Clean up reminders for deleted tasks
export const cleanupDeletedTaskReminders = async () => {
	try {
		const taskIds = Array.from(scheduledJobs.keys());

		for (const taskId of taskIds) {
			const task = await Task.findById(taskId);
			if (!task) {
				cancelTaskReminder(taskId);
			}
		}
	} catch (error) {
		console.error("Failed to cleanup deleted task reminders:", error);
	}
};

// Get all scheduled reminders (for debugging/admin purposes)
export const getScheduledReminders = () => {
	return Array.from(scheduledJobs.keys());
};
