<template>
	<div class="flex h-screen bg-base-300">
		<!-- Sidebar -->
		<CategoryList class="w-1/5 min-w-[220px] border-r border-base-200" />
		<!-- Notes/Tasks List -->
		<NoteTaskList class="w-1/4 min-w-[260px] border-r border-base-200" />
		<!-- Main Content Area -->
		<NoteTaskEditor class="flex-1" />
	</div>
</template>

<script setup>
import CategoryList from "./components/CategoryList.vue";
import NoteTaskList from "./components/NoteTaskList.vue";
import NoteTaskEditor from "./components/NoteTaskEditor.vue";
</script>
