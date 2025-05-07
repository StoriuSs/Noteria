<template>
	<section class="h-full p-6 flex flex-col">
		<input
			class="input input-bordered w-full mb-2"
			placeholder="Note Title:" />
		<QuillEditor class="flex-1 mb-4 bg-base-200 rounded-lg" theme="snow" />
		<div class="flex gap-2 mt-2">
			<button class="btn btn-info">Save</button>
			<button class="btn btn-neutral">Delete</button>
		</div>
	</section>
</template>

<script setup>
import { QuillEditor } from "@vueup/vue-quill";
</script>
