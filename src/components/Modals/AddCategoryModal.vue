<template>
	<div class="bg-[#34496C] p-8 rounded-lg shadow-lg w-96">
		<label class="block text-blue-200 text-lg mb-2">Category Name:</label>
		<input
			v-model="newCategoryName"
			v-autofocus
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
		<div class="flex gap-4">
			<button
				class="btn btn-accent"
				@click="
					emit('add', { name: newCategoryName, color: selectedColor })
				">
				Add
			</button>
			<button class="btn btn-outline btn-warning" @click="emit('close')">
				Cancel
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { vAutofocus } from "../../directives/vAutofocus";

const emit = defineEmits(["add", "close"]);
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
</script>
