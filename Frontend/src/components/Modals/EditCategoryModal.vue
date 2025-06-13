<template>
	<div class="bg-[#34496C] p-8 rounded-lg shadow-lg w-96">
		<label class="block text-blue-200 text-lg mb-2"
			>Edit Category Name:</label
		>
		<input
			v-model="editedCategoryName"
			class="input input-bordered w-full mb-4" />
		<div class="flex gap-3 mb-4">
			<span
				v-for="color in colors"
				:key="color"
				class="w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center"
				:style="{
					'border-color':
						selectedColor === color ? '#fff' : 'transparent',
				}"
				@click="selectedColor = color">
				<span
					class="w-5 h-5 rounded-full"
					:style="{ 'background-color': color }"></span>
			</span>
		</div>
		<div class="flex gap-4 items-center">
			<button
				class="btn btn-accent"
				@click="
					emit('edit', {
						_id: props.category._id,
						name: editedCategoryName,
						color: selectedColor,
					})
				">
				Save
			</button>
			<button class="btn btn-outline btn-warning" @click="emit('close')">
				Cancel
			</button>
			<!-- Delete Icon Button -->
			<button
				class="btn btn-ghost btn-square ml-auto"
				@click="emit('delete', { _id: props.category._id })"
				:title="'Delete Category'">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-red-400"
					viewBox="0 0 20 20"
					fill="currentColor">
					<path
						fill-rule="evenodd"
						d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
						clip-rule="evenodd" />
				</svg>
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from "vue";
const emit = defineEmits(["edit", "close", "delete"]);
const props = defineProps({
	category: {
		type: Object,
		required: true,
	},
});

const categoryId = ref(props.category?._id);

const editedCategoryName = ref(props.category?.name || "");
const selectedColor = ref(props.category?.color || "#e67e22");
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

// Update fields if prop changes
watch(
	() => props.category,
	(newCat) => {
		editedCategoryName.value = newCat?.name || "";
		selectedColor.value = newCat?.color || "#e67e22";
		categoryId.value = newCat?._id;
	},
	{ immediate: true }
);
</script>
