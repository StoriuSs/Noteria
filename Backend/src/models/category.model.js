import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		name: {
			type: String,
			required: [true, "Category name is required"],
			trim: true,
		},

		color: {
			type: String,
			required: true,
			enum: [
				"#e67e22",
				"#b4b800",
				"#6ea204",
				"#1abc9c",
				"#3498db",
				"#3b82f6",
				"#a78bfa",
				"#e879f9",
				"#e74c3c",
			],
			default: "#e67e22",
		},
	},
	{
		timestamps: true,
	}
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
