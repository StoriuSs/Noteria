import { defineStore } from "pinia";
import { useDateFormat } from "@vueuse/core";

export const useTaskStore = defineStore("task", {
	state: () => ({
		tasks: [],
		currentTask: null,
	}),

	getters: {
		getTaskById: (state) => (id) => {
			return state.tasks.find((task) => task.id === id);
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
		addTask(task) {
			this.tasks.push({
				id: crypto.randomUUID(),
				type: "task",
				status: "pending",
				...task,
				createdAt: useDateFormat(new Date(), "YYYY-MM-DD HH:mm:ss")
					.value,
				updatedAt: useDateFormat(new Date(), "YYYY-MM-DD HH:mm:ss")
					.value,
			});
		},

		updateTask(id, updates) {
			const index = this.tasks.findIndex((task) => task.id === id);
			if (index !== -1) {
				this.tasks[index] = {
					...this.tasks[index],
					...updates,
					updatedAt: useDateFormat(new Date(), "YYYY-MM-DD HH:mm:ss")
						.value,
				};
			}
		},

		deleteTask(id) {
			const index = this.tasks.findIndex((task) => task.id === id);
			if (index !== -1) {
				this.tasks.splice(index, 1);
			}
		},

		setTaskStatus(id, status) {
			const index = this.tasks.findIndex((task) => task.id === id);
			if (index !== -1) {
				this.tasks[index].status = status;
				this.tasks[index].updatedAt = useDateFormat(
					new Date(),
					"YYYY-MM-DD HH:mm:ss"
				).value;
			}
		},

		setCurrentTask(taskId) {
			this.currentTask = taskId;
		},
	},
});
