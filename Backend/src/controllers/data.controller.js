import Category from "../models/category.model.js";
import Note from "../models/note.model.js";
import Task from "../models/task.model.js";
import mongoose from "mongoose";

export const importAllData = async (req, res, next) => {
	const { categories, notes, tasks } = req.body;
	const userId = req.user._id;

	if (!categories || !notes || !tasks) {
		return res.status(400).json({ message: "Invalid backup file format." });
	}

	try {
		// 1. Delete all existing data for the user
		await Category.deleteMany({ userId });
		await Note.deleteMany({ userId });
		await Task.deleteMany({ userId });

		// 2. Create new categories and map old IDs to new IDs
		const categoryIdMap = new Map();
		const newCategories = [];

		for (const category of categories) {
			const oldId = category._id;
			const newCategory = new Category({
				...category,
				_id: new mongoose.Types.ObjectId(), // Generate new ID
				userId: userId,
			});
			newCategories.push(newCategory);
			categoryIdMap.set(oldId, newCategory._id);
		}
		if (newCategories.length > 0) {
			await Category.insertMany(newCategories);
		}

		// 3. Create new notes with mapped category IDs
		const newNotes = notes.map((note) => ({
			...note,
			_id: new mongoose.Types.ObjectId(),
			userId: userId,
			categoryId: categoryIdMap.get(note.categoryId), // Use the new category ID
		}));
		if (newNotes.length > 0) {
			await Note.insertMany(newNotes);
		}

		// 4. Create new tasks with mapped category IDs
		const newTasks = tasks.map((task) => ({
			...task,
			_id: new mongoose.Types.ObjectId(),
			userId: userId,
			categoryId: categoryIdMap.get(task.categoryId), // Use the new category ID
		}));
		if (newTasks.length > 0) {
			await Task.insertMany(newTasks);
		}

		res.status(200).json({ message: "Data imported successfully." });
	} catch (error) {
		next(error);
	}
};
