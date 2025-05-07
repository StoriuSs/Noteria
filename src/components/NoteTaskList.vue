<template>
	<section class="h-full p-4 flex flex-col bg-base-100">
		<input
			class="input input-bordered w-full mb-2"
			placeholder="Search in note content" />
		<div class="flex gap-2 mb-2">
			<button class="btn btn-info">+ Note</button>
			<button class="btn btn-secondary">+ Task</button>
		</div>
		<ul class="flex-1 overflow-y-auto">
			<li class="mb-1">
				<button class="btn btn-ghost w-full justify-start">
					TestNote
				</button>
			</li>
			<li class="mb-1">
				<button class="btn btn-ghost w-full justify-start">
					TestTask
				</button>
			</li>
		</ul>
	</section>
</template>
