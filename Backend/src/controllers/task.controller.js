import Task from "../models/task.model.js";
import Category from "../models/category.model.js";
import {
	scheduleTaskReminder,
	updateTaskReminder,
	cancelTaskReminder,
} from "../services/reminder.service.js";

// Get all tasks for the authenticated user by category
export const getCategoryTasks = async (req, res) => {
	try {
		const userId = req.user._id;
		const { categoryId } = req.params;
		if (!categoryId) {
			return res.status(400).json({ message: "Category ID is required" });
		}
		const filter = { userId: userId, categoryId: categoryId };
		const tasks = await Task.find(filter).sort({ updatedAt: -1 });
		res.json(tasks);
	} catch (err) {
		res.status(500).json({
			message: "Failed to fetch tasks",
			error: err.message,
		});
	}
};

export const getAllTasks = async (req, res) => {
	try {
		const userId = req.user._id;
		const tasks = await Task.find({ userId }).sort({ updatedAt: -1 });
		res.json(tasks);
	} catch (err) {
		res.status(500).json({
			message: "Failed to fetch tasks",
			error: err.message,
		});
	}
};

// Create a new task
export const createTask = async (req, res) => {
	try {
		const userId = req.user._id;
		const {
			title,
			description,
			categoryId,
			status,
			priority,
			dueDate,
			subtasks,
			hasReminder,
			reminderTime,
			reminderType,
		} = req.body;

		if (!title || !categoryId) {
			return res
				.status(400)
				.json({ message: "Title and categoryId are required" });
		}

		// Check if category exists and belongs to user
		const category = await Category.findOne({ _id: categoryId, userId });
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		const task = await Task.create({
			userId,
			categoryId,
			title,
			description: description || "",
			status: status || "pending",
			priority: priority || "medium",
			dueDate: dueDate || null,
			subtasks: subtasks || [],
			hasReminder: hasReminder || false,
			reminderTime: reminderTime || null,
			reminderType: reminderType || null,
		});

		// Schedule reminder if email reminder is set
		if (
			task.hasReminder &&
			task.reminderType === "email" &&
			task.reminderTime
		) {
			await scheduleTaskReminder(task._id);
		}

		res.status(201).json(task);
	} catch (err) {
		res.status(500).json({
			message: "Failed to create task",
			error: err.message,
		});
	}
};

// Update a task
export const updateTask = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id } = req.params;
		const {
			title,
			description,
			categoryId,
			status,
			priority,
			dueDate,
			subtasks,
			hasReminder,
			reminderTime,
			reminderType,
		} = req.body;

		const task = await Task.findOne({ _id: id, userId });
		if (!task) {
			return res.status(404).json({ message: "Task not found" });
		}

		// Store old reminder settings to check if they changed
		const oldReminderSettings = {
			hasReminder: task.hasReminder,
			reminderType: task.reminderType,
			reminderTime: task.reminderTime,
		};

		if (title !== undefined) task.title = title;
		if (description !== undefined) task.description = description;
		if (status !== undefined) task.status = status;
		if (priority !== undefined) task.priority = priority;
		if (dueDate !== undefined) task.dueDate = dueDate;
		if (subtasks !== undefined) task.subtasks = subtasks;
		if (hasReminder !== undefined) task.hasReminder = hasReminder;
		if (reminderTime !== undefined) task.reminderTime = reminderTime;
		if (reminderType !== undefined) task.reminderType = reminderType;

		if (categoryId !== undefined) {
			// Check if new category exists and belongs to user
			const category = await Category.findOne({
				_id: categoryId,
				userId,
			});
			if (!category) {
				return res.status(404).json({ message: "Category not found" });
			}
			task.categoryId = categoryId;
		}

		await task.save();

		// Update reminder if reminder settings changed
		const newReminderSettings = {
			hasReminder: task.hasReminder,
			reminderType: task.reminderType,
			reminderTime: task.reminderTime,
		};

		if (
			JSON.stringify(oldReminderSettings) !==
			JSON.stringify(newReminderSettings)
		) {
			await updateTaskReminder(task._id);
		}

		res.json(task);
	} catch (err) {
		res.status(500).json({
			message: "Failed to update task",
			error: err.message,
		});
	}
};

// Delete a task
export const deleteTask = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id } = req.params;
		const task = await Task.findOneAndDelete({ _id: id, userId });
		if (!task) {
			return res.status(404).json({ message: "Task not found" });
		}

		// Cancel any scheduled reminders for this task
		cancelTaskReminder(id);

		res.json({ message: "Task deleted successfully", data: task });
	} catch (err) {
		res.status(500).json({
			message: "Failed to delete task",
			error: err.message,
		});
	}
};

// Delete all tasks in a category for the authenticated user
export const deleteAllTasks = async (req, res) => {
	try {
		const userId = req.user._id;
		const { categoryId } = req.params;
		if (!categoryId) {
			return res.status(400).json({ message: "Category ID is required" });
		}

		// Get all tasks in the category to cancel their reminders
		const tasks = await Task.find({ userId, categoryId });
		for (const task of tasks) {
			cancelTaskReminder(task._id);
		}

		const result = await Task.deleteMany({ userId, categoryId });
		res.json({
			message: `Deleted ${result.deletedCount} tasks in category.`,
		});
	} catch (err) {
		res.status(500).json({
			message: "Failed to delete tasks in category",
			error: err.message,
		});
	}
};
