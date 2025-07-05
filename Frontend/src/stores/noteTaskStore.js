import { defineStore } from "pinia";
import { useNoteStore } from "./noteStore";
import { useTaskStore } from "./taskStore";
import { useCategoryStore } from "./categoryStore";
import axios from "axios";

const API_URL = "https://noteria-backend.onrender.com/api/v1/data";

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
		filteredItemsByQuery: (state) => {
			const noteStore = useNoteStore();
			const taskStore = useTaskStore();
			const categoryStore = useCategoryStore();
			const query = categoryStore.searchQuery?.trim().toLowerCase();
			if (!query) return [];

			// Always search all notes and tasks, regardless of currentCategory
			const noteResults = noteStore.getAllNotes
				.filter(
					(note) =>
						note.title && note.title.toLowerCase().includes(query)
				)
				.map((note) => ({ ...note, type: "note" }));

			const taskResults = taskStore.getAllTasks
				.filter(
					(task) =>
						task.title && task.title.toLowerCase().includes(query)
				)
				.map((task) => ({ ...task, type: "task" }));

			return [...noteResults, ...taskResults];
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

		async exportAllData() {
			const categoryStore = useCategoryStore();
			const noteStore = useNoteStore();
			const taskStore = useTaskStore();

			// Always fetch latest data before exporting
			await Promise.all([
				categoryStore.fetchCategories(),
				noteStore.fetchAllNotes(),
				taskStore.fetchAllTasks(),
			]);

			const exportObject = {
				categories: categoryStore.categories,
				notes: noteStore.notes,
				tasks: taskStore.tasks,
			};

			const dataStr = JSON.stringify(exportObject, null, 2);
			const blob = new Blob([dataStr], {
				type: "text/plain;charset=utf-8",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			const date = new Date().toISOString().slice(0, 10);
			link.download = `noteria_backup_${date}.json`;
			link.click();
			URL.revokeObjectURL(url);
		},

		async importAllData(fileContent) {
			try {
				const data = JSON.parse(fileContent);
				if (
					!confirm(
						"Are you sure you want to import this file? All your current data will be deleted and replaced. This action cannot be undone."
					)
				) {
					return;
				}

				await axios.post(`${API_URL}/import`, data, {
					withCredentials: true,
				});
				window.location.reload();
			} catch (error) {
				throw new Error(
					error.response?.data?.message || "Failed to import data."
				);
			}
		},
	},
});
