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

			return [...notes, ...tasks];
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
		async fetchAllItems() {
			const noteStore = useNoteStore();
			const taskStore = useTaskStore();

			await Promise.all([
				noteStore.fetchAllNotes(),
				taskStore.fetchAllTasks(),
			]);
		},

		async fetchItemsByCategory(categoryId) {
			const noteStore = useNoteStore();
			const taskStore = useTaskStore();

			await Promise.all([
				noteStore.fetchNotes(categoryId),
				taskStore.fetchTasks(categoryId),
			]);
		},

		async addItem({ type, title, categoryId, content = "" }) {
			if (!title?.trim()) return;
			const noteStore = useNoteStore();
			const taskStore = useTaskStore();

			if (type === "note") {
				const note = await noteStore.addNote({
					title,
					categoryId,
					content,
				});
				return { _id: note._id, type: "note" };
			} else {
				const task = await taskStore.addTask({
					title,
					categoryId,
					status: "pending",
					priority: "medium",
					description: content || "",
					dueDate: null,
					subtasks: [],
					hasReminder: false,
					reminderTime: null,
					reminderType: null,
				});
				return { _id: task._id, type: "task" };
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

		async updateItem(id, type, updates) {
			const noteStore = useNoteStore();
			const taskStore = useTaskStore();
			if (type === "note") {
				await noteStore.updateNote(id, updates);
			} else if (type === "task") {
				await taskStore.updateTask(id, updates);
			}
		},

		async deleteItem(id, type) {
			const noteStore = useNoteStore();
			const taskStore = useTaskStore();
			if (type === "note") {
				await noteStore.deleteNote(id);
			} else if (type === "task") {
				await taskStore.deleteTask(id);
			}
		},

		async deleteItemsByCategory(categoryId) {
			const noteStore = useNoteStore();
			const taskStore = useTaskStore();
			// Delete all notes in this category
			await noteStore.deleteNotesByCategory(categoryId);
			// Delete all tasks in this category
			await taskStore.deleteTasksByCategory(categoryId);
		},
	},
});
