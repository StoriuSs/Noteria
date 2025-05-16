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
			<li class="mb-1" v-for="category in categories" :key="category.id">
				<button
					class="btn btn-ghost w-full justify-start"
					:style="{ 'background-color': '#304262' }">
					<span
						class="inline-block w-4 h-4 rounded-full mr-2"
						:style="{ 'background-color': category.color }"></span>
					{{ category.name }}
				</button>
			</li>
		</ul>

		<!-- Add Category Modal -->
		<div
			v-if="showModal"
			class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
			<AddCategoryModal
				@add="addCategory"
				@close="closeModal"></AddCategoryModal>
		</div>
	</aside>
</template>

<script setup>
import { ref } from "vue";
import { useCategoryStore } from "../../stores/categoryStore";
import AddCategoryModal from "../Modals/AddCategoryModal.vue";

const showModal = ref(false);
const categoryStore = useCategoryStore();
const categories = categoryStore.getCategories;

function addCategory({ name, color }) {
	if (!name.trim()) return;
	categoryStore.addCategory(name, color);
	closeModal();
}

function closeModal() {
	showModal.value = false;
}
</script>
