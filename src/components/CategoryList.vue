<template>
	<aside class="h-full p-4 flex flex-col bg-base-200">
		<div class="flex items-center mb-6 gap-1">
			<img src="../assets/img/notes.png" alt="Logo" />
			<span class="font-bold text-xl tracking-wide mr-auto">NOTERIA</span>
			<img
				src="../assets/img/hide.png"
				alt="Collapse-icon"
				class="cursor-pointer" />
		</div>
		<input
			class="input input-bordered w-full mb-2"
			placeholder="Search note" />
		<button class="btn btn-primary w-full mb-2">+ Category</button>
		<ul class="flex-1 overflow-y-auto">
			<li class="mb-1">
				<button
					class="btn btn-ghost w-full justify-start"
					style="background-color: #304262">
					<span
						class="inline-block w-4 h-4 rounded-full mr-2"
						style="background-color: #e74c3c"></span>
					Test 1
				</button>
			</li>

			<li class="mb-1">
				<button class="btn btn-ghost w-full justify-start">
					<span
						class="inline-block w-4 h-4 rounded-full mr-2"
						style="background-color: blue"></span>
					Test 2
				</button>
			</li>
		</ul>

		<!-- <div class="flex gap-2 mt-4 opacity-50">
			<button class="btn btn-square btn-ghost">
				<i class="i-lucide-sun"></i>
			</button>
			<button class="btn btn-square btn-ghost">
				<i class="i-lucide-globe"></i>
			</button>
			<button class="btn btn-square btn-ghost">
				<i class="i-lucide-refresh-cw"></i>
			</button>
		</div> -->
	</aside>
</template>
