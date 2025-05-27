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
				<div
					class="tooltip w-full"
					:data-tip="`${item.type} | ${item.updatedAt}`">
					<button
						@click="
							noteTaskStore.setCurrentItem(item.id, item.type)
						"
						class="btn btn-ghost w-full justify-start"
						:style="{
							'background-color':
								noteTaskStore.currentItem === item.id &&
								noteTaskStore.currentItemType === item.type
									? '#304262'
									: 'transparent',
						}">
						<span class="flex items-center w-full">
							<!-- Color indicator -->
							<span
								class="inline-block flex-shrink-0 w-4 h-4 rounded-full mr-2"
								:style="{
									'background-color':
										item.type === 'note'
											? '#00a9e7'
											: '#DE2A8A',
								}"></span>

							<!-- Title -->
							<span
								class="flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap">
								{{ item.title }}
							</span>
						</span>
					</button>
				</div>
			</li>
		</ul>

		<div
			v-if="showModal"
			class="fixed inset-0 flex items-center justify-center z-50">
			<BaseModal
				:modalTitle="modalTitle"
				@add="addItem($event)"
				@close="closeModal" />
		</div>
		<!-- $event here is the custom data (the title string) that was emitted from the BaseModal component.  -->
	</section>
</template>

<script setup>
import { ref, computed } from "vue";
import BaseModal from "../Modals/BaseModal.vue";
import { useCategoryStore } from "../../stores/categoryStore";
import { useNoteTaskStore } from "../../stores/noteTaskStore";

const showModal = ref(false);
const modalTitle = ref("");
const categoryStore = useCategoryStore();
const noteTaskStore = useNoteTaskStore();

const allNotesAndTasks = computed(() =>
	noteTaskStore.getItemsByCategory(categoryStore.currentCategory)
);

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

const addItem = (title) => {
	if (!title?.trim()) {
		alert("Note/Task title cannot be empty!");
		return;
	}
	noteTaskStore.addItem({
		type: modalTitle.value === "Note Title" ? "note" : "task",
		title,
		categoryId: categoryStore.currentCategory,
	});

	const items = noteTaskStore.getItemsByCategory(
		categoryStore.currentCategory
	);
	if (items.length > 0) {
		// Set the first item (newly added) as current
		noteTaskStore.setCurrentItem(items[0].id, items[0].type);
	}
	closeModal();
};

const closeModal = () => {
	showModal.value = false;
};
</script>
