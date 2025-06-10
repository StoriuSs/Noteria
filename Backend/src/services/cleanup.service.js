import cron from "node-cron";
import User from "../models/user.model.js";

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

export const startCleanupJob = () => {
	// Schedule to run everyday at midnight
	cron.schedule("0 0 * * *", cleanupUnverifiedUsers);
	console.log("Scheduled job for cleaning up unverified users.");
};
