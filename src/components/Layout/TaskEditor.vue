<template>
	<section class="h-full p-8 flex flex-col overflow-hidden">
		<!-- Task Header -->
		<div class="flex items-center gap-4 mb-5 pb-3 border-b border-base-200">
			<!-- Status Checkbox -->
			<div class="relative">
				<input
					type="checkbox"
					:checked="status === 'completed'"
					@change="toggleStatus"
					class="checkbox checkbox-primary checkbox-md" />
				<div
					v-if="status === 'completed'"
					class="absolute inset-0 flex items-center justify-center pointer-events-none"></div>
			</div>

			<!-- Title Input -->
			<input
				v-model="title"
				class="input input-ghost text-2xl font-semibold flex-1 px-2 hover:bg-base-200 focus:bg-base-200 transition-colors"
				:class="{ 'line-through opacity-60': status === 'completed' }"
				placeholder="Task Title" />
		</div>

		<!-- Task Details -->
		<div class="grid grid-cols-2 gap-6 mb-8">
			<!-- Due Date -->
			<div class="form-control">
				<label class="label">
					<span class="label-text font-medium">Due Date</span>
				</label>
				<div class="relative">
					<input
						type="datetime-local"
						v-model="dueDate"
						class="input input-bordered w-full pr-10"
						:class="{ 'input-warning': isOverdue }" />
				</div>
			</div>

			<!-- Priority -->
			<div class="form-control">
				<label class="label">
					<span class="label-text font-medium">Priority</span>
				</label>
				<select
					v-model="priority"
					class="select select-bordered w-full"
					:class="{
						'select-error': priority === 'high',
						'select-warning': priority === 'medium',
						'select-success': priority === 'low',
					}">
					<option value="low">Low Priority</option>
					<option value="medium">Medium Priority</option>
					<option value="high">High Priority</option>
				</select>
			</div>
		</div>

		<!-- Reminder Settings -->
		<div class="mb-8 p-4 rounded-lg bg-base-200">
			<div class="flex items-center justify-between mb-4">
				<label class="label">
					<span class="label-text font-medium">Reminder</span>
				</label>
				<label class="label cursor-pointer gap-2">
					<span class="label-text">Enable Reminder</span>
					<input
						type="checkbox"
						v-model="hasReminder"
						class="toggle toggle-primary" />
				</label>
			</div>

			<div v-if="hasReminder" class="grid grid-cols-2 gap-6">
				<!-- Reminder Time -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Remind me at</span>
					</label>
					<div class="relative">
						<input
							type="datetime-local"
							v-model="reminderTime"
							class="input input-bordered w-full pr-10" />
					</div>
				</div>

				<!-- Reminder Type -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Reminder Type</span>
					</label>
					<select
						v-model="reminderType"
						class="select select-bordered w-full">
						<option value="notification">Notification</option>
						<option value="email">Email</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Description -->
		<div class="form-control mb-8">
			<label class="label">
				<span class="label-text font-medium mr-5">Description</span>
			</label>
			<textarea
				v-model="description"
				class="textarea textarea-bordered h-30 resize-none focus:resize-x"
				placeholder="Add a description..."></textarea>
		</div>

		<!-- Subtasks -->
		<div class="flex flex-col flex-1 min-h-0 mb-8">
			<div class="flex items-center justify-between mb-4">
				<label class="label">
					<span class="label-text font-medium">Subtasks</span>
					<span class="label-text-alt text-base-content/60">
						{{ completedSubtasks }}/{{ subtasks.length }} completed
					</span>
				</label>
				<button
					class="btn btn-primary btn-sm gap-2"
					@click="addSubtask">
					+ Add Subtask
				</button>
			</div>
			<div class="space-y-3 overflow-y-auto flex-1 min-h-0">
				<div
					v-for="(subtask, index) in subtasks"
					:key="index"
					class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors">
					<input
						type="checkbox"
						v-model="subtask.completed"
						class="checkbox checkbox-primary" />
					<input
						v-model="subtask.title"
						class="input input-ghost flex-1"
						:class="{
							'line-through opacity-60': subtask.completed,
						}"
						placeholder="Subtask" />
					<button
						class="btn btn-ghost btn-sm btn-circle"
						@click="removeSubtask(index)">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clip-rule="evenodd" />
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-3 mt-auto pt-4 border-t border-base-200 z-10">
			<button class="btn btn-accent" @click="updateTask">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor">
					<path
						fill-rule="evenodd"
						d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
						clip-rule="evenodd" />
				</svg>
				Save Changes
			</button>
			<button class="btn btn-outline btn-error" @click="deleteTask">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor">
					<path
						fill-rule="evenodd"
						d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
						clip-rule="evenodd" />
				</svg>
				Delete Task
			</button>
		</div>
	</section>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useNoteTaskStore } from "../../stores/noteTaskStore";

const noteTaskStore = useNoteTaskStore();
const currentTask = computed(() => noteTaskStore.getCurrentItem);

// Local state
const title = ref("");
const description = ref("");
const status = ref("pending");
const priority = ref("medium");
const dueDate = ref("");
const subtasks = ref([]);
const hasReminder = ref(false);
const reminderTime = ref("");
const reminderType = ref("notification");

// Computed properties
const completedSubtasks = computed(
	() => subtasks.value.filter((subtask) => subtask.completed).length
);

const isOverdue = computed(() => {
	if (!dueDate.value) return false;
	const due = new Date(dueDate.value);
	const now = new Date();
	return due < now && status.value !== "completed";
});

// Watch for changes in current task
watch(
	currentTask,
	(task) => {
		if (task && task.type === "task") {
			title.value = task.title;
			description.value = task.description || "";
			status.value = task.status || "pending";
			priority.value = task.priority || "medium";
			dueDate.value = task.dueDate || "";
			subtasks.value = task.subtasks || [];
			hasReminder.value = task.hasReminder || false;
			reminderTime.value = task.reminderTime || "";
			reminderType.value = task.reminderType || "notification";
		} else {
			// Reset form
			title.value = "";
			description.value = "";
			status.value = "pending";
			priority.value = "medium";
			dueDate.value = "";
			subtasks.value = [];
			hasReminder.value = false;
			reminderTime.value = "";
			reminderType.value = "notification";
		}
	},
	{ immediate: true }
);

// Toggle task status
const toggleStatus = () => {
	status.value = status.value === "completed" ? "pending" : "completed";
};

// Add new subtask
const addSubtask = () => {
	subtasks.value.push({ title: "", completed: false });
};

// Remove subtask
const removeSubtask = (index) => {
	subtasks.value.splice(index, 1);
};

// Update task in store
const updateTask = () => {
	if (!currentTask.value) return;

	noteTaskStore.updateItem(currentTask.value.id, "task", {
		title: title.value,
		description: description.value,
		status: status.value,
		priority: priority.value,
		dueDate: dueDate.value,
		subtasks: subtasks.value,
		hasReminder: hasReminder.value,
		reminderTime: hasReminder.value ? reminderTime.value : null,
		reminderType: hasReminder.value ? reminderType.value : null,
	});
};

// Delete current task
const deleteTask = () => {
	if (!currentTask.value) return;

	if (confirm("Are you sure you want to delete this task?")) {
		noteTaskStore.deleteItem(currentTask.value.id, "task");
		noteTaskStore.clearCurrentItem();
	}
};
</script>
