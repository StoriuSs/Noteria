import cron from "node-cron";
import User from "../models/user.model.js";
import { cleanupDeletedTaskReminders } from "./reminder.service.js";

const cleanupUnverifiedUsers = async () => {
	try {
		const result = await User.deleteMany({
			isVerified: false,
			verificationTokenExpires: { $lt: Date.now() },
		});
		console.log(`Cleaned up ${result.deletedCount} unverified users.`);
	} catch (error) {
		console.error("Error during cleanup of unverified users:", error);
	}
};

const cleanupTaskReminders = async () => {
	try {
		await cleanupDeletedTaskReminders();
		console.log("Cleaned up reminders for deleted tasks.");
	} catch (error) {
		console.error("Error during cleanup of task reminders:", error);
	}
};

export const startCleanupJob = () => {
	// Schedule to run everyday at midnight
	cron.schedule("0 0 * * *", cleanupUnverifiedUsers);
	console.log("Scheduled job for cleaning up unverified users.");

	// Schedule to run every hour for task reminder cleanup
	cron.schedule("0 * * * *", cleanupTaskReminders);
	console.log("Scheduled job for cleaning up task reminders.");
};
