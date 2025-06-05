import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
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
			required: [true, "Note Title is required"],
			trim: true,
		},
		content: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
