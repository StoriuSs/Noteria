<template>
	<div class="flex h-screen bg-base-300">
		<!-- Sidebar -->
		<CategoryList class="w-1/6 min-w-[220px] border-r border-base-200" />
		<!-- Notes/Tasks List -->
		<NoteTaskList class="w-1/6 min-w-[260px] border-r border-base-200" />
		<!-- Main Content Area -->
		<div v-if="type === 'note'" class="flex-1">
			<NoteEditor class="flex-1" />
		</div>
		<div v-else-if="type === 'task'" class="flex-1">
			<TaskEditor class="flex-1" />
		</div>
		<div v-else class="flex-1">
			<div class="flex-1">
				<Welcome class="flex-1" />
			</div>
		</div>
	</div>
</template>

<script setup>
import CategoryList from "./components/Layout/CategoryList.vue";
import NoteTaskList from "./components/Layout/NoteTaskList.vue";
import Welcome from "./components/Layout/Welcome.vue";
import NoteEditor from "./components/Layout/NoteEditor.vue";
import TaskEditor from "./components/Layout/TaskEditor.vue";
import { useNoteTaskStore } from "./stores/noteTaskStore";
import { computed } from "vue";

const noteTaskStore = useNoteTaskStore();
const type = computed(() => noteTaskStore.currentItemType);
</script>
