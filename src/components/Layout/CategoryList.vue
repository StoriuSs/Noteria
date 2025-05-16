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
					:style="{ backgroundColor: '#304262' }">
					<span
						class="inline-block w-4 h-4 rounded-full mr-2"
						:style="{ backgroundColor: category.color }"></span>
					{{ category.name }}
				</button>
			</li>
		</ul>

		<!-- Add Category Modal -->
		<div
			v-if="showModal"
			class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
			<div class="bg-blue-900 p-8 rounded-lg shadow-lg w-96">
				<label class="block text-blue-200 text-lg mb-2"
					>Category Name:</label
				>
				<input
					v-model="newCategoryName"
					class="input input-bordered w-full mb-4" />
				<div class="flex gap-3 mb-4">
					<span
						v-for="color in colors"
						:key="color"
						class="w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center"
						:style="{
							borderColor:
								selectedColor === color
									? '#fff'
									: 'transparent',
						}"
						@click="selectedColor = color">
						<span
							class="w-5 h-5 rounded-full"
							:style="{ backgroundColor: color }"></span>
					</span>
				</div>
				<div class="flex gap-4">
					<button class="btn btn-primary" @click="addCategory">
						Add
					</button>
					<button class="btn btn-neutral" @click="closeModal">
						Cancel
					</button>
				</div>
			</div>
		</div>
	</aside>
</template>

<script setup>
import { ref } from "vue";
import { useCategoryStore } from "../../stores/categoryStore";

const showModal = ref(false);
const newCategoryName = ref("");
const selectedColor = ref("#e67e22");
const colors = [
	"#e67e22",
	"#b4b800",
	"#6ea204",
	"#1abc9c",
	"#3498db",
	"#3b82f6",
	"#a78bfa",
	"#e879f9",
	"#e74c3c",
];

const categoryStore = useCategoryStore();
const categories = categoryStore.getCategories;

function addCategory() {
	if (!newCategoryName.value.trim()) return;
	categoryStore.addCategory({
		name: newCategoryName.value,
		color: selectedColor.value,
	});
	closeModal();
}

function closeModal() {
	showModal.value = false;
	newCategoryName.value = "";
	selectedColor.value = colors[0];
}
</script>
