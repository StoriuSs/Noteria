import { defineStore } from "pinia";
import { useDateFormat } from "@vueuse/core";

export const useCategoryStore = defineStore("category", {
	state: () => ({
		categories: [],
		currentCategory: null,
	}),

	getters: {
		getCategoryById: (state) => (id) => {
			return state.categories.find((category) => category.id === id);
		},
		getCategories: (state) => state.categories,
	},

	actions: {
		addCategory(category) {
			this.categories.push({
				id: crypto.randomUUID(),
				...category,
				createdAt: useDateFormat(new Date(), "YYYY-MM-DD HH:mm:ss")
					.value,
			});
		},

		updateCategory(id, updates) {
			const index = this.categories.findIndex(
				(category) => category.id === id
			);
			if (index !== -1) {
				this.categories[index] = {
					...this.categories[index],
					...updates,
					updatedAt: useDateFormat(new Date(), "YYYY-MM-DD HH:mm:ss")
						.value,
				};
			}
		},

		deleteCategory(id) {
			const index = this.categories.findIndex(
				(category) => category.id === id
			);
			if (index !== -1) {
				this.categories.splice(index, 1);
			}
		},

		setCurrentCategory(categoryId) {
			this.currentCategory = categoryId;
		},
	},
});
