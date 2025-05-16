import { defineStore } from "pinia";
import { useDateFormat } from "@vueuse/core";

export const useNoteStore = defineStore("note", {
	state: () => ({
		notes: [],
		currentNote: null,
	}),

	getters: {
		getNoteById: (state) => (id) => {
			return state.notes.find((note) => note.id === id);
		},
		getNotesByCategory: (state) => (categoryId) => {
			return state.notes.filter((note) => note.categoryId === categoryId);
		},
		getAllNotes: (state) => state.notes,
	},

	actions: {
		addNote(note) {
			this.notes.push({
				id: crypto.randomUUID(),
				...note,
				createdAt: useDateFormat(new Date(), "YYYY-MM-DD HH:mm:ss")
					.value,
				updatedAt: useDateFormat(new Date(), "YYYY-MM-DD HH:mm:ss")
					.value,
			});
		},

		updateNote(id, updates) {
			const index = this.notes.findIndex((note) => note.id === id);
			if (index !== -1) {
				this.notes[index] = {
					...this.notes[index],
					...updates,
					updatedAt: useDateFormat(new Date(), "YYYY-MM-DD HH:mm:ss")
						.value,
				};
			}
		},

		deleteNote(id) {
			const index = this.notes.findIndex((note) => note.id === id);
			if (index !== -1) {
				this.notes.splice(index, 1);
			}
		},

		setCurrentNote(noteId) {
			this.currentNote = noteId;
		},
	},
});
