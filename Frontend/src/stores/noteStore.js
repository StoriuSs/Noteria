import { defineStore } from "pinia";
import axios from "axios";
import { toast } from "vue3-toastify";
import { useAuthStore } from "./authStore";

const API_URL = "https://noteria-backend.onrender.com/api/v1/notes";

export const useNoteStore = defineStore("note", {
	state: () => ({
		notes: [],
		currentNote: null,
		loading: false,
	}),

	getters: {
		getNoteById: (state) => (id) => {
			return state.notes.find((note) => note._id === id);
		},
		getNotesByCategory: (state) => (categoryId) => {
			return state.notes.filter((note) => note.categoryId === categoryId);
		},
		getAllNotes: (state) => state.notes,
	},

	actions: {
		async fetchNotes(categoryId) {
			this.loading = true;
			try {
				const authStore = useAuthStore();
				if (!authStore.accessToken) throw new Error("No access token");
				const response = await axios.get(
					`${API_URL}/category/${categoryId}`,
					{
						headers: {
							Authorization: `Bearer ${authStore.accessToken}`,
						},
						withCredentials: true,
					}
				);

				this.notes = response.data.map((note) => ({
					...note,
					type: "note",
				}));
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Failed to fetch notes"
				);
			} finally {
				this.loading = false;
			}
		},

		async fetchAllNotes() {
			this.loading = true;
			try {
				const authStore = useAuthStore();
				if (!authStore.accessToken) throw new Error("No access token");
				const response = await axios.get(API_URL, {
					headers: {
						Authorization: `Bearer ${authStore.accessToken}`,
					},
					withCredentials: true,
				});

				this.notes = response.data.map((note) => ({
					...note,
					type: "note",
				}));
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Failed to fetch notes"
				);
			} finally {
				this.loading = false;
			}
		},

		async addNote({ title, content, categoryId }) {
			this.loading = true;
			try {
				const authStore = useAuthStore();
				if (!authStore.accessToken) throw new Error("No access token");
				const response = await axios.post(
					API_URL,
					{ title, content, categoryId },
					{
						headers: {
							Authorization: `Bearer ${authStore.accessToken}`,
						},
						withCredentials: true,
					}
				);
				const note = response.data;
				this.notes.unshift({ ...note, type: "note" });
				toast.success("Note created!");
				return note;
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Failed to create note"
				);
			} finally {
				this.loading = false;
			}
		},

		async updateNote(id, updates) {
			this.loading = true;
			try {
				const authStore = useAuthStore();
				if (!authStore.accessToken) throw new Error("No access token");
				const response = await axios.put(`${API_URL}/${id}`, updates, {
					headers: {
						Authorization: `Bearer ${authStore.accessToken}`,
					},
					withCredentials: true,
				});
				const note = response.data;
				const idx = this.notes.findIndex((n) => n._id === id);
				if (idx !== -1) this.notes[idx] = { ...note, type: "note" };
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Failed to update note"
				);
			} finally {
				this.loading = false;
			}
		},

		async deleteNote(id) {
			this.loading = true;
			try {
				const authStore = useAuthStore();
				if (!authStore.accessToken) throw new Error("No access token");
				await axios.delete(`${API_URL}/${id}`, {
					headers: {
						Authorization: `Bearer ${authStore.accessToken}`,
					},
					withCredentials: true,
				});
				this.notes = this.notes.filter((n) => n._id !== id);
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Failed to delete note"
				);
			} finally {
				this.loading = false;
			}
		},

		async deleteNotesByCategory(categoryId) {
			this.loading = true;
			try {
				const authStore = useAuthStore();
				if (!authStore.accessToken) throw new Error("No access token");
				await axios.delete(`${API_URL}/category/${categoryId}`, {
					headers: {
						Authorization: `Bearer ${authStore.accessToken}`,
					},
					withCredentials: true,
				});
				this.notes = this.notes.filter(
					(n) => n.categoryId !== categoryId
				);
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Failed to delete notes"
				);
			} finally {
				this.loading = false;
			}
		},

		setCurrentNote(noteId) {
			this.currentNote = noteId;
		},
	},
});
