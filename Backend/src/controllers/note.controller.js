import Note from "../models/note.model.js";
import Category from "../models/category.model.js";

// Get all notes for the authenticated user by category
export const getAllNotes = async (req, res) => {
	try {
		const userId = req.user._id;
		const { categoryId } = req.params;
		if (!categoryId) {
			return res.status(400).json({ message: "Category ID is required" });
		}
		const filter = { userId: userId, categoryId: categoryId };
		const notes = await Note.find(filter).sort({ updatedAt: -1 });
		res.json(notes);
	} catch (err) {
		res.status(500).json({
			message: "Failed to fetch notes",
			error: err.message,
		});
	}
};

// Create a new note
export const createNote = async (req, res) => {
	try {
		const userId = req.user._id;
		const { title, content, categoryId } = req.body;
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
		const note = await Note.create({
			userId,
			categoryId,
			title,
			content: content || "",
		});
		res.status(201).json(note);
	} catch (err) {
		res.status(500).json({
			message: "Failed to create note",
			error: err.message,
		});
	}
};

// Update a note
export const updateNote = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id } = req.params;
		const { title, content, categoryId } = req.body;
		const note = await Note.findOne({ _id: id, userId });
		if (!note) {
			return res.status(404).json({ message: "Note not found" });
		}
		if (title !== undefined) note.title = title;
		if (content !== undefined) note.content = content;
		if (categoryId !== undefined) {
			// Check if new category exists and belongs to user
			const category = await Category.findOne({
				_id: categoryId,
				userId,
			});
			if (!category) {
				return res.status(404).json({ message: "Category not found" });
			}
			note.categoryId = categoryId;
		}
		await note.save();
		res.json(note);
	} catch (err) {
		res.status(500).json({
			message: "Failed to update note",
			error: err.message,
		});
	}
};

// Delete a note
export const deleteNote = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id } = req.params;
		const note = await Note.findOneAndDelete({ _id: id, userId });
		if (!note) {
			return res.status(404).json({ message: "Note not found" });
		}
		res.json({ message: "Note deleted successfully", data: note });
	} catch (err) {
		res.status(500).json({
			message: "Failed to delete note",
			error: err.message,
		});
	}
};

// Delete all notes in a category for the authenticated user
export const deleteAllNotes = async (req, res) => {
	try {
		const userId = req.user._id;
		const { categoryId } = req.params;
		if (!categoryId) {
			return res.status(400).json({ message: "Category ID is required" });
		}
		const result = await Note.deleteMany({ userId, categoryId });
		res.json({
			message: `Deleted ${result.deletedCount} notes in category.`,
		});
	} catch (err) {
		res.status(500).json({
			message: "Failed to delete notes in category",
			error: err.message,
		});
	}
};
