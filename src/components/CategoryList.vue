<template>
	<aside class="h-full p-4 flex flex-col bg-base-200">
		<div class="flex items-center gap-2 mb-6">
			<!-- <img src="/logo.png" alt="Logo" class="w-8 h-8" /> -->
			<span class="font-bold text-xl tracking-wide">NOTEMOD</span>
		</div>
		<input
			class="input input-bordered w-full mb-2"
			placeholder="Search note" />
		<button class="btn btn-primary w-full mb-2">+ Category</button>
		<ul class="flex-1 overflow-y-auto">
			<li class="mb-1">
				<button class="btn btn-ghost w-full justify-start">Test</button>
			</li>
		</ul>
		<div class="flex gap-2 mt-4 opacity-50">
			<button class="btn btn-square btn-ghost">
				<i class="i-lucide-sun"></i>
			</button>
			<button class="btn btn-square btn-ghost">
				<i class="i-lucide-globe"></i>
			</button>
			<button class="btn btn-square btn-ghost">
				<i class="i-lucide-refresh-cw"></i>
			</button>
		</div>
	</aside>
</template>
