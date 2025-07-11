import { defineStore } from "pinia";
import axios from "axios";
import { toast } from "vue3-toastify";
import { useAuthStore } from "./authStore";

const API_URL = "http://localhost:8080/api/v1/tasks";

export const useTaskStore = defineStore("task", {
	state: () => ({
		tasks: [],
		currentTask: null,
		loading: false,
	}),

	getters: {
		getTaskById: (state) => (id) => {
			return state.tasks.find((task) => task._id === id);
		},
		getTasksByCategory: (state) => (categoryId) => {
			return state.tasks.filter((task) => task.categoryId === categoryId);
		},
		getTasksByStatus: (state) => (status) => {
			return state.tasks.filter((task) => task.status === status);
		},
		getAllTasks: (state) => state.tasks,
	},

	actions: {
		async fetchTasks(categoryId) {
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
				this.tasks = response.data.map((task) => ({
					...task,
					type: "task",
				}));
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Failed to fetch tasks"
				);
			} finally {
				this.loading = false;
			}
		},

		async fetchAllTasks() {
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
				this.tasks = response.data.map((task) => ({
					...task,
					type: "task",
				}));
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Failed to fetch tasks"
				);
			} finally {
				this.loading = false;
			}
		},

		async addTask(taskData) {
			this.loading = true;
			try {
				const authStore = useAuthStore();
				if (!authStore.accessToken) throw new Error("No access token");
				const response = await axios.post(API_URL, taskData, {
					headers: {
						Authorization: `Bearer ${authStore.accessToken}`,
					},
					withCredentials: true,
				});
				const task = response.data;
				this.tasks.unshift({ ...task, type: "task" });
				toast.success("Task created!");
				return task;
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Failed to create task"
				);
			} finally {
				this.loading = false;
			}
		},

		async updateTask(id, updates) {
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
				const task = response.data;
				const idx = this.tasks.findIndex((t) => t._id === id);
				if (idx !== -1) this.tasks[idx] = { ...task, type: "task" };
				toast.success("Task updated successfully!");
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Failed to update task"
				);
			} finally {
				this.loading = false;
			}
		},

		async deleteTask(id) {
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
				this.tasks = this.tasks.filter((t) => t._id !== id);
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Failed to delete task"
				);
			} finally {
				this.loading = false;
			}
		},

		async deleteTasksByCategory(categoryId) {
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
				this.tasks = this.tasks.filter(
					(t) => t.categoryId !== categoryId
				);
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Failed to delete tasks"
				);
			} finally {
				this.loading = false;
			}
		},

		setCurrentTask(taskId) {
			this.currentTask = taskId;
		},
	},
});
