<template>
	<section class="h-full p-4 flex flex-col bg-base-100">
		<input
			class="input input-bordered w-full mb-4"
			placeholder="Search in note content" />
		<div class="flex gap-2 mb-4">
			<button class="btn btn-info w-28" @click="showNoteModal">
				+ Note
			</button>
			<button class="btn btn-secondary w-28" @click="showTaskModal">
				+ Task
			</button>
		</div>
		<ul class="flex-1 overflow-y-auto">
			<li v-for="item in allNotesAndTasks" :key="item.id" class="mb-1.5">
				<button
					@click="setCurrentItem(item)"
					class="btn btn-ghost w-full justify-start"
					:style="{
						'background-color':
							(item.type === 'note' &&
								noteStore.currentNote === item.id) ||
							(item.type === 'task' &&
								taskStore.currentTask === item.id)
								? '#304262'
								: 'transparent',
					}">
					<span
						class="inline-block w-4 h-4 rounded-full mr-2"
						:style="{
							'background-color':
								item.type === 'note' ? '#00a9e7' : '#DE2A8A',
						}"></span>
					{{ item.title }}
				</button>
			</li>
		</ul>

		<div
			v-if="showModal"
			class="fixed inset-0 flex items-center justify-center z-50">
			<BaseModal
				:modalTitle="modalTitle"
				@add="
					modalTitle === 'Note Title'
						? addNote($event)
						: addTask($event)
				"
				@close="closeModal" />
		</div>
	</section>
</template>

<script setup>
import { ref, computed } from "vue";
import BaseModal from "../Modals/BaseModal.vue";
import { useNoteStore } from "../../stores/noteStore";
import { useTaskStore } from "../../stores/taskStore";
import { useCategoryStore } from "../../stores/categoryStore";

const showModal = ref(false);
const modalTitle = ref("");
const noteStore = useNoteStore();
const taskStore = useTaskStore();
const categoryStore = useCategoryStore();

const notesByCategory = computed(() =>
	noteStore.getNotesByCategory(categoryStore.currentCategory)
);

const tasksByCategory = computed(() =>
	taskStore.getTasksByCategory(categoryStore.currentCategory)
);

const allNotesAndTasks = computed(() => [
	...notesByCategory.value,
	...tasksByCategory.value,
]);

const showNoteModal = () => {
	if (categoryStore.currentCategory === null) {
		alert("A category must be selected first!");
		return;
	}
	showModal.value = true;
	modalTitle.value = "Note Title";
};

const showTaskModal = () => {
	if (categoryStore.currentCategory === null) {
		alert("A category must be selected first!");
		return;
	}
	showModal.value = true;
	modalTitle.value = "Task Title";
};

const addNote = (title) => {
	if (!title?.trim()) {
		alert("Note title cannot be empty!");
		return;
	}
	noteStore.addNote({
		title,
		categoryId: categoryStore.currentCategory,
		content: "",
	});
	closeModal();
};

const addTask = (title) => {
	if (!title?.trim()) {
		alert("Task title cannot be empty!");
		return;
	}
	taskStore.addTask({
		title,
		categoryId: categoryStore.currentCategory,
	});
	closeModal();
};
const closeModal = () => {
	showModal.value = false;
};

const setCurrentItem = (item) => {
	if (item.type === "note") {
		noteStore.setCurrentNote(item.id);
		taskStore.setCurrentTask(null);
	} else {
		taskStore.setCurrentTask(item.id);
		noteStore.setCurrentNote(null);
	}
};
</script>
