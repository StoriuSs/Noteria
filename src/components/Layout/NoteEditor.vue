<template>
	<section class="h-full p-6 flex flex-col overflow-hidden">
		<!-- Title Input -->
		<input
			v-model="title"
			class="input input-bordered w-full mb-4 text-2xl font-semibold"
			placeholder="Note Title" />

		<!-- Note Editor -->
		<QuillEditor
			v-model:content="content"
			:key="currentNote?.id"
			class="flex-1 mb-4 bg-base-200 rounded-lg overflow-auto"
			theme="snow"
			toolbar="full" />
		<div class="flex gap-3 mt-2 items-center">
			<!-- Action Buttons -->
			<button class="btn btn-accent gap-2" @click="updateNote">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor">
					<path
						fill-rule="evenodd"
						d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
						clip-rule="evenodd" />
				</svg>
				Save Changes
			</button>
			<button
				class="btn btn-outline btn-error mr-auto"
				@click="deleteNote">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor">
					<path
						fill-rule="evenodd"
						d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
						clip-rule="evenodd" />
				</svg>
				Delete Note
			</button>

			<span class="text-md opacity-70">
				<span class="mr-3"> Word Count: {{ wordCount }} </span>
				<span> Last Updated: {{ currentNote.updatedAt }} </span>
			</span>
		</div>
	</section>
</template>

<script setup>
import { QuillEditor } from "@vueup/vue-quill";
import { useNoteTaskStore } from "../../stores/noteTaskStore";
import { ref, computed, watch } from "vue";

const noteTaskStore = useNoteTaskStore();

const title = ref("");
const content = ref("");
const currentNote = computed(() => noteTaskStore.getCurrentItem);

watch(
	currentNote,
	(note) => {
		if (note && note.type === "note") {
			title.value = note.title || "";
			content.value = note.content || "";
		} else {
			title.value = "";
			content.value = "";
		}
	},
	{ immediate: true }
);

const updateNote = () => {
	if (!currentNote.value) return;

	noteTaskStore.updateItem(currentNote.value.id, "note", {
		title: title.value,
		content: content.value,
	});
};

const deleteNote = () => {
	if (!currentNote.value) return;

	if (confirm("Are you sure you want to delete this note?")) {
		noteTaskStore.deleteItem(currentNote.value.id, "note");
		noteTaskStore.clearCurrentItem();
	}
};

const wordCount = computed(() => {
	let text = "";

	// Handle Quill Delta format or plain string
	if (typeof content.value === "string") {
		text = content.value;
	} else if (
		content.value &&
		content.value.ops &&
		Array.isArray(content.value.ops)
	) {
		text = content.value.ops
			.map((op) => (typeof op.insert === "string" ? op.insert : ""))
			.join(" ");
	}

	const plain = text.replace(/<[^>]*>/g, " ").trim();
	return plain ? plain.split(/\s+/).length : 0;
});
</script>
