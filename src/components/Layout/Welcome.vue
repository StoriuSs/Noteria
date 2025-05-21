<template>
	<section
		class="h-full p-8 flex flex-col items-center justify-center text-center">
		<div class="max-w-2xl">
			<h1 class="text-4xl font-bold mb-6">Welcome to Noteria!</h1>

			<div class="grid grid-cols-2 gap-8 mb-12">
				<!-- Notes Section -->
				<div class="card bg-base-200 p-6">
					<div class="flex items-center gap-3 mb-4">
						<span class="w-4 h-4 rounded-full bg-info"></span>
						<h2 class="text-xl font-semibold">Notes</h2>
					</div>
					<p class="text-[#848A98] mb-4">
						Create and organize your notes with rich text editing,
						categories, and search functionality.
					</p>
					<ul class="text-left space-y-2 text-sm">
						<li
							class="flex items-center gap-2"
							v-for="noteAbility in noteAbilities"
							:key="noteAbility">
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
							{{ noteAbility }}
						</li>
					</ul>
				</div>

				<!-- Tasks Section -->
				<div class="card bg-base-200 p-6">
					<div class="flex items-center gap-3 mb-4">
						<span class="w-4 h-4 rounded-full bg-secondary"></span>
						<h2 class="text-xl font-semibold">Tasks</h2>
					</div>
					<p class="text-[#848A98] mb-4">
						Create and manage your tasks with priorities, due dates,
						reminders, and subtasks.
					</p>
					<ul class="text-left space-y-2 text-sm">
						<li
							class="flex items-center gap-2"
							v-for="taskAbility in taskAbilities"
							:key="taskAbility">
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
							{{ taskAbility }}
						</li>
					</ul>
				</div>
			</div>

			<div class="text-[#848A98]">
				<p class="mb-4">To get started:</p>
				<ol
					class="list-decimal list-inside space-y-2 text-left max-w-md mx-auto">
					<li>Select or create a category from the sidebar</li>
					<li>
						Click "+ Note" or "+ Task" to create your first item
					</li>
					<li>Start organizing your notes and tasks!</li>
				</ol>
			</div>
		</div>
	</section>
</template>

<script setup>
import { ref } from "vue";

const noteAbilities = ref([
	"Rich text editor with formatting",
	"Organize with categories",
	"Quick search functionality",
]);

const taskAbilities = ref([
	"Set priorities and due dates",
	"Add reminders and notifications",
	"Create and track subtasks",
]);
</script>
