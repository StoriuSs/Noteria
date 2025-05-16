<template>
	<section class="h-full p-4 flex flex-col bg-base-100">
		<input
			class="input input-bordered w-full mb-2"
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
			<li v-for="note in notes" :key="note.id" class="mb-1.5">
				<button
					class="btn btn-ghost w-full justify-start"
					:style="{ 'background-color': '#304262' }">
					<span
						class="inline-block w-4 h-4 rounded-full mr-2"
						:style="{
							'background-color':
								categoryStore.getCategoryById(note.categoryId)
									?.color || '#00a9e7',
						}"></span>
					{{ note.title }}
				</button>
			</li>
		</ul>

		<div
			v-if="showModal"
			class="fixed inset-0 flex items-center justify-center z-50">
			<BaseModal
				:modalTitle="modalTitle"
				@add="modalTitle === 'Add Note' ? addNote($event) : null"
				@close="closeModal" />
		</div>
	</section>
</template>

<script setup>
import { ref, computed } from "vue";
import BaseModal from "../Modals/BaseModal.vue";
import { useNoteStore } from "../../stores/noteStore";
import { useCategoryStore } from "../../stores/categoryStore";

const showModal = ref(false);
const modalTitle = ref("");
const noteStore = useNoteStore();
const categoryStore = useCategoryStore();

const notes = computed(() => noteStore.getAllNotes);

const showNoteModal = () => {
	showModal.value = true;
	modalTitle.value = "Add Note";
};

const showTaskModal = () => {
	showModal.value = true;
	modalTitle.value = "Add Task";
};

const addNote = (title) => {
	if (!title?.trim()) return;
	noteStore.addNote({
		title,
		categoryId: categoryStore.currentCategory,
		content: "",
	});
	closeModal();
};

const closeModal = () => {
	showModal.value = false;
};
</script>
