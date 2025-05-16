<template>
	<section class="h-full p-6 flex flex-col overflow-hidden">
		<input
			class="input input-bordered w-full mb-4"
			placeholder="Note Title" />
		<QuillEditor
			class="flex-1 mb-4 bg-base-200 rounded-lg overflow-auto"
			theme="snow"
			toolbar="full" />
		<div class="flex gap-2 mt-2">
			<button class="btn btn-accent">Save</button>
			<button class="btn btn-outline btn-warning">Delete</button>
		</div>
	</section>
</template>

<script setup>
import { QuillEditor } from "@vueup/vue-quill";
</script>
