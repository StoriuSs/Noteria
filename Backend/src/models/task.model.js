import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, "Subtask title is required"],
		trim: true,
	},
	completed: {
		type: Boolean,
		default: false,
	},
});

const taskSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		categoryId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: true,
		},
		title: {
			type: String,
			required: [true, "Task Title is required"],
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			enum: ["pending", "completed"],
			default: "pending",
			required: true,
		},
		priority: {
			type: String,
			enum: ["low", "medium", "high"],
			default: "medium",
			required: true,
		},
		dueDate: {
			type: Date,
		},
		subtasks: {
			type: [subtaskSchema], // Array of sub-documents using the subtaskSchema
			default: [],
		},
		hasReminder: {
			type: Boolean,
			default: false,
		},
		reminderTime: {
			type: Date,
		},
		reminderType: {
			type: String,
			enum: ["notification", "email"],
		},
	},
	{
		timestamps: true,
	}
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
