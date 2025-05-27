import { defineStore } from "pinia";
import { useNoteStore } from "./noteStore";
import { useTaskStore } from "./taskStore";

export const useNoteTaskStore = defineStore("noteTask", {
	state: () => ({
		currentItem: null,
		currentItemType: null,
	}),

	getters: {
		getItemsByCategory: (state) => (categoryId) => {
			const noteStore = useNoteStore();
			const taskStore = useTaskStore();

			const notes = noteStore.getNotesByCategory(categoryId);
			const tasks = taskStore.getTasksByCategory(categoryId);

			// Sort by updated date
			return [...notes, ...tasks].sort(
				(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
			);
		},

		getCurrentItem: (state) => {
			if (!state.currentItem) return null;

			const noteStore = useNoteStore();
			const taskStore = useTaskStore();

			return state.currentItemType === "note"
				? noteStore.getNoteById(state.currentItem)
				: taskStore.getTaskById(state.currentItem);
		},
	},

	actions: {
		addItem({ type, title, categoryId, content = "" }) {
			if (!title?.trim()) return;
			const noteStore = useNoteStore();
			const taskStore = useTaskStore();

			if (type === "note") {
				noteStore.addNote({
					title,
					categoryId,
					content,
				});
			} else {
				taskStore.addTask({
					title,
					categoryId,
					status: "pending",
					priority: "medium",
					description: "",
					dueDate: "",
					subtasks: [],
					hasReminder: false,
					reminderTime: null,
					reminderType: null,
				});
			}
		},

		setCurrentItem(itemId, type) {
			if (!itemId || !type) return;
			this.currentItem = itemId;
			this.currentItemType = type;

			const noteStore = useNoteStore();
			const taskStore = useTaskStore();

			if (type === "note") {
				noteStore.setCurrentNote(itemId);
				taskStore.setCurrentTask(null);
			} else {
				taskStore.setCurrentTask(itemId);
				noteStore.setCurrentNote(null);
			}
		},

		clearCurrentItem() {
			this.currentItem = null;
			this.currentItemType = null;

			const noteStore = useNoteStore();
			const taskStore = useTaskStore();

			noteStore.setCurrentNote(null);
			taskStore.setCurrentTask(null);
		},

		updateItem(id, type, updates) {
			const noteStore = useNoteStore();
			const taskStore = useTaskStore();

			if (type === "note") {
				noteStore.updateNote(id, updates);
			} else if (type === "task") {
				taskStore.updateTask(id, updates);
			}
		},

		deleteItem(id, type) {
			const noteStore = useNoteStore();
			const taskStore = useTaskStore();

			if (type === "note") {
				noteStore.deleteNote(id);
			} else if (type === "task") {
				taskStore.deleteTask(id);
			}
		},
	},
});
