<template>
	<div class="flex h-screen bg-base-300">
		<!-- Sidebar -->
		<CategoryList class="w-1/6 min-w-[220px] border-r border-base-200" />
		<!-- Notes/Tasks List -->
		<NoteTaskList class="w-1/6 min-w-[260px] border-r border-base-200" />
		<!-- Main Content Area -->
		<NoteTaskEditor class="flex-1" />
	</div>
</template>

<script setup>
import CategoryList from "./components/Layout/CategoryList.vue";
import NoteTaskList from "./components/Layout/NoteTaskList.vue";
import NoteTaskEditor from "./components/Layout/NoteTaskEditor.vue";
</script>
