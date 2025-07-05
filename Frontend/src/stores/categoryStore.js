import { defineStore } from "pinia";
import axios from "axios";
import { toast } from "vue3-toastify";
import { useAuthStore } from "./authStore";

const API_URL = "https://noteria-backend.onrender.com/api/v1/categories";

export const useCategoryStore = defineStore("category", {
	state: () => ({
		categories: [],
		currentCategory: null,
		loading: false,
		searchQuery: "",
	}),

	getters: {
		getCategoryById: (state) => (id) => {
			return state.categories.find((category) => category._id === id);
		},
		getCategories: (state) => state.categories,
	},

	actions: {
		async fetchCategories() {
			try {
				this.loading = true;
				const authStore = useAuthStore();

				if (!authStore.accessToken) {
					throw new Error("No access token available");
				}

				const response = await axios.get(API_URL, {
					headers: {
						Authorization: `Bearer ${authStore.accessToken}`,
					},
					withCredentials: true,
				});

				// Load categories and apply saved order
				this.categories = response.data.data;
				this.applySavedOrder();
			} catch (error) {
				console.error("Error fetching categories:", error);
				toast.error(
					"Failed to load categories. Please refresh the page."
				);
			} finally {
				this.loading = false;
			}
		},

		async addCategory(name, color) {
			try {
				this.loading = true;
				const authStore = useAuthStore();

				if (!authStore.accessToken) {
					throw new Error("No access token available");
				}

				const response = await axios.post(
					API_URL,
					{ name, color },
					{
						headers: {
							Authorization: `Bearer ${authStore.accessToken}`,
						},
						withCredentials: true,
					}
				);

				const newCategory = response.data.data;
				this.categories.unshift(newCategory);

				// Add new category to the beginning of saved order
				const savedOrder = JSON.parse(
					localStorage.getItem("categoryOrder") || "[]"
				);
				savedOrder.unshift(newCategory._id);
				localStorage.setItem(
					"categoryOrder",
					JSON.stringify(savedOrder)
				);

				toast.success("Category created successfully!");
			} catch (error) {
				toast.error(
					error.response?.data?.message ||
						"Creating new category failed! Please try again"
				);
				throw error;
			} finally {
				this.loading = false;
			}
		},

		// Save category order to localStorage
		saveCategoryOrder(categories) {
			const order = categories.map((category) => category._id);
			localStorage.setItem("categoryOrder", JSON.stringify(order));
		},

		// Apply saved order to categories array
		applySavedOrder() {
			const savedOrder = JSON.parse(
				localStorage.getItem("categoryOrder") || "[]"
			);

			if (savedOrder.length === 0) {
				return;
			}

			// Create a map for quick lookup
			const categoryMap = new Map(
				this.categories.map((cat) => [cat._id, cat])
			);

			// Reorder the categories array
			const reorderedCategories = [];

			// Add categories in saved order
			savedOrder.forEach((catId) => {
				const category = categoryMap.get(catId);
				if (category) {
					reorderedCategories.push(category);
					categoryMap.delete(catId);
				}
			});

			// Add any remaining categories (new ones not in saved order)
			categoryMap.forEach((category) => {
				reorderedCategories.push(category);
			});

			console.log(
				"Categories after reorder:",
				reorderedCategories.map((cat) => cat._id)
			);

			// Update the store's categories array
			this.categories = reorderedCategories;
		},

		async updateCategory(id, updates) {
			try {
				this.loading = true;
				const authStore = useAuthStore();

				if (!authStore.accessToken) {
					throw new Error("No access token available");
				}

				const response = await axios.put(`${API_URL}/${id}`, updates, {
					headers: {
						Authorization: `Bearer ${authStore.accessToken}`,
					},
					withCredentials: true,
				});

				// Update the category in the store with the response from backend
				const updatedCategory = response.data.data;
				const index = this.categories.findIndex(
					(category) => category._id === id
				);
				if (index !== -1) {
					this.categories[index] = updatedCategory;
				}

				toast.success("Category updated successfully!");
			} catch (error) {
				toast.error(
					error.response?.data?.message ||
						"Failed to update category. Please try again."
				);
				throw error;
			} finally {
				this.loading = false;
			}
		},

		async deleteCategory(id) {
			try {
				this.loading = true;
				const authStore = useAuthStore();

				if (!authStore.accessToken) {
					throw new Error("No access token available");
				}

				await axios.delete(`${API_URL}/${id}`, {
					headers: {
						Authorization: `Bearer ${authStore.accessToken}`,
					},
					withCredentials: true,
				});

				// Remove from local store
				const index = this.categories.findIndex(
					(category) => category._id === id
				);
				if (index !== -1) {
					this.categories.splice(index, 1);
				}

				// Remove from saved order
				const savedOrder = JSON.parse(
					localStorage.getItem("categoryOrder") || "[]"
				);
				const newOrder = savedOrder.filter((catId) => catId !== id);
				localStorage.setItem("categoryOrder", JSON.stringify(newOrder));

				// Clear current category if it was the deleted one
				if (this.currentCategory === id) {
					this.currentCategory =
						this.categories.length > 0
							? this.categories[0]._id
							: null;
				}
				toast.success("Category deleted successfully!");
			} catch (error) {
				toast.error(
					error.response?.data?.message ||
						"Failed to delete category. Please try again."
				);
				throw error;
			} finally {
				this.loading = false;
			}
		},
		setCurrentCategory(categoryId) {
			this.currentCategory = categoryId;
		},
	},
});
