<template>
	<div class="bg-[#34496C] p-8 rounded-lg shadow-lg w-96">
		<label class="block text-blue-200 text-lg mb-2">{{ modalTitle }}</label>
		<input
			v-model="title"
			v-autofocus
			class="input input-bordered w-full mb-4" />
		<div class="flex gap-4">
			<button class="btn btn-accent" @click="emit('add', title)">
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
const props = defineProps({
	modalTitle: {
		type: String,
		required: true,
	},
});
const title = ref(null);
</script>
