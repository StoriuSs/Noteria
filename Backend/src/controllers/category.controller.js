import Category from "../models/category.model.js";

// Get all categories for the authenticated user
export const getAllCategories = async (req, res, next) => {
	try {
		const categories = await Category.find({ userId: req.user._id });
		res.status(200).json({
			success: true,
			data: categories,
		});
	} catch (error) {
		next(error);
	}
};

// Create a new category
export const createCategory = async (req, res, next) => {
	try {
		const { name, color } = req.body;
		const category = await Category.create({
			userId: req.user._id,
			name,
			color,
		});
		res.status(201).json({
			success: true,
			message: "Category created successfully",
			data: category,
		});
	} catch (error) {
		next(error);
	}
};

// Update a category (must belong to user)
export const updateCategory = async (req, res, next) => {
	try {
		const { name, color } = req.body;
		const category = await Category.findOneAndUpdate(
			{ _id: req.params.id, userId: req.user._id },
			{ name, color },
			{ new: true, runValidators: true }
		);
		if (!category) {
			return res
				.status(404)
				.json({ success: false, message: "Category not found" });
		}
		res.status(200).json({ success: true, data: category });
	} catch (error) {
		next(error);
	}
};

// Delete a category (must belong to user)
export const deleteCategory = async (req, res, next) => {
	try {
		const category = await Category.findOneAndDelete({
			_id: req.params.id,
			userId: req.user._id,
		});
		if (!category) {
			return res
				.status(404)
				.json({ success: false, message: "Category not found" });
		}
		res.status(200).json({ success: true, message: "Category deleted" });
	} catch (error) {
		next(error);
	}
};
