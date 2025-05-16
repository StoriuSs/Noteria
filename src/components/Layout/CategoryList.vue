<template>
	<aside class="h-full p-4 flex flex-col bg-base-200">
		<div class="flex items-center mb-6 gap-1">
			<img src="../../assets/img/notes.png" alt="Logo" />
			<span class="font-bold text-xl tracking-wide mr-auto">NOTERIA</span>
			<img
				src="../../assets/img/hide.png"
				alt="Collapse-icon"
				class="cursor-pointer" />
		</div>
		<input
			class="input input-bordered w-full mb-2"
			placeholder="Search note" />
		<button class="btn btn-primary w-full mb-4" @click="showModal = true">
			+ Category
		</button>
		<ul class="flex-1 overflow-y-auto">
			<li
				class="mb-1.5"
				v-for="category in categories"
				:key="category.id">
				<button
					class="btn btn-ghost w-full flex justify-start category-button"
					:style="{
						'background-color':
							currentCategory === category.id
								? '#304262'
								: 'transparent',
					}"
					@click="setCurrentCategory(category.id)">
					<span
						class="inline-block w-4 h-4 rounded-full mr-2"
						:style="{ 'background-color': category.color }"></span>
					{{ category.name }}
					<svg
						class="feather feather-edit ml-auto edit-icon"
						fill="none"
						height="24"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						viewBox="0 0 24 24"
						width="24"
						xmlns="http://www.w3.org/2000/svg">
						<path
							d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
						<path
							d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
					</svg>
				</button>
			</li>
		</ul>

		<!-- Add Category Modal -->
		<div
			v-if="showModal"
			class="fixed inset-0 flex items-center justify-center z-50">
			<AddCategoryModal
				@add="addCategory"
				@close="closeModal"></AddCategoryModal>
		</div>
	</aside>
</template>

<script setup>
import { ref, computed } from "vue";
import { useCategoryStore } from "../../stores/categoryStore";
import AddCategoryModal from "../Modals/AddCategoryModal.vue";

const showModal = ref(false);
const categoryStore = useCategoryStore();
const categories = categoryStore.getCategories;
const currentCategory = computed(() => categoryStore.currentCategory);

function addCategory({ name, color }) {
	if (!name.trim()) return;
	categoryStore.addCategory(name, color);
	closeModal();
}

function closeModal() {
	showModal.value = false;
}

function setCurrentCategory(categoryId) {
	categoryStore.setCurrentCategory(categoryId);
}
</script>

<style scoped>
/* Hide the edit icon */
.edit-icon {
	opacity: 0;
	transition: opacity 0.2s ease;
}

/* Show the edit icon on hover */
.category-button:hover .edit-icon {
	opacity: 1;
}
</style>
