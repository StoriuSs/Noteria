<template>
	<section class="h-full p-4 flex flex-col bg-base-100">
		<button class="btn btn-outline mb-4" @click="clearCurrentTargets">
			Clear current targets
		</button>
		<div class="flex gap-2 mb-4">
			<button class="btn btn-info flex-1" @click="showNoteModal">
				+ Note
			</button>
			<button class="btn btn-secondary flex-1" @click="showTaskModal">
				+ Task
			</button>
		</div>
		<!-- Show filtered items if searching -->
		<div v-if="categoryStore.searchQuery.trim()">
			<div
				v-if="filteredItems.length === 0"
				class="text-center text-gray-400 mt-8">
				No items found.
			</div>
			<div v-for="item in filteredItems" :key="item._id" class="mb-1.5">
				<button
					class="btn btn-ghost w-full justify-start"
					:style="{
						'background-color':
							noteTaskStore.currentItem === item._id &&
							noteTaskStore.currentItemType === item.type
								? '#304262'
								: 'transparent',
						color:
							noteTaskStore.currentItem === item._id &&
							noteTaskStore.currentItemType === item.type
								? '#FFFFFF'
								: '',
					}"
					@click="handleSearchItemClick(item)">
					<span class="flex items-center w-full">
						<span
							class="inline-block flex-shrink-0 w-4 h-4 rounded-full mr-2"
							:style="{
								'background-color':
									item.type === 'note'
										? '#00a9e7'
										: '#DE2A8A',
							}"></span>
						<span
							class="flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap">
							{{ item.title }}
						</span>
						<span
							v-if="item.type === 'task'"
							class="ml-2 text-xs text-pink-400"
							>Task</span
						>
						<span v-else class="ml-2 text-xs text-sky-400"
							>Note</span
						>
					</span>
				</button>
			</div>
		</div>
		<!-- Otherwise, show normal list -->
		<VueDraggable
			v-else
			tag="div"
			ref="el"
			class="flex-1 overflow-y-auto"
			:animation="200"
			v-model="localItems">
			<div v-for="item in localItems" :key="item._id" class="mb-1.5">
				<div class="tooltip w-full">
					<button
						@click="
							noteTaskStore.setCurrentItem(item._id, item.type)
						"
						class="btn btn-ghost w-full justify-start"
						:style="{
							'background-color':
								noteTaskStore.currentItem === item._id &&
								noteTaskStore.currentItemType === item.type
									? '#304262'
									: 'transparent',
							color:
								noteTaskStore.currentItem === item._id &&
								noteTaskStore.currentItemType === item.type
									? '#FFFFFF'
									: '',
						}">
						<span class="flex items-center w-full">
							<!-- Color indicator -->
							<span
								class="inline-block flex-shrink-0 w-4 h-4 rounded-full mr-2"
								:style="{
									'background-color':
										item.type === 'note'
											? '#00a9e7'
											: '#DE2A8A',
								}"></span>
							<!-- Title -->
							<span
								class="flex-1 text-left overflow-hidden text-ellipsis whitespace-nowrap">
								{{ item.title }}
							</span>
						</span>
					</button>
				</div>
			</div>
		</VueDraggable>

		<div
			v-if="showModal"
			class="fixed inset-0 flex items-center justify-center z-50">
			<BaseModal
				:modalTitle="modalTitle"
				@add="addItem($event)"
				@close="closeModal" />
		</div>
		<!-- $event here is the custom data (the title string) that was emitted from the BaseModal component.  -->
	</section>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import BaseModal from "../Modals/BaseModal.vue";
import { useCategoryStore } from "../../stores/categoryStore";
import { useNoteTaskStore } from "../../stores/noteTaskStore";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { VueDraggable } from "vue-draggable-plus";
import debounce from "lodash/debounce";

const showModal = ref(false);
const modalTitle = ref("");
const categoryStore = useCategoryStore();
const noteTaskStore = useNoteTaskStore();

const filteredItems = computed(() => {
	if (!categoryStore.searchQuery.trim()) return [];
	return noteTaskStore.filteredItemsByQuery;
});

watch(
	() => categoryStore.searchQuery,
	debounce(async (query) => {
		if (query.trim()) {
			await noteTaskStore.fetchAllItems();
		}
	}, 300),
	{ immediate: false }
);

function handleSearchItemClick(item) {
	categoryStore.currentCategory = item.categoryId;
	noteTaskStore.setCurrentItem(item._id, item.type);
	categoryStore.searchQuery = "";
}

// Create a local ref for VueDraggable
const localItems = ref([]);

// Function to save order to localStorage
const saveItemOrder = (categoryId, items) => {
	const itemIds = items.map((item) => item._id);
	const allOrders = JSON.parse(localStorage.getItem("itemOrder") || "{}");
	allOrders[categoryId] = itemIds;
	localStorage.setItem("itemOrder", JSON.stringify(allOrders));
};

// Function to load order from localStorage
const loadItemOrder = (categoryId, allItems) => {
	try {
		const allOrders = JSON.parse(localStorage.getItem("itemOrder") || "{}");
		const savedOrder = allOrders[categoryId];

		if (savedOrder && savedOrder.length > 0) {
			const orderedItems = [];
			const itemMap = new Map(allItems.map((item) => [item._id, item]));

			// Add items in saved order
			savedOrder.forEach((itemId) => {
				const item = itemMap.get(itemId);
				if (item) {
					orderedItems.push(item);
					itemMap.delete(itemId);
				}
			});

			// Add remaining items
			itemMap.forEach((item) => {
				orderedItems.unshift(item);
			});

			return orderedItems;
		}
	} catch (error) {
		console.error("Failed to load item order:", error);
	}

	// Return default order if no saved order
	return allItems.sort(
		(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
	);
};

const isCategorySwitching = ref(false);

// Watch for category changes and handle item loading/ordering
watch(
	() => categoryStore.currentCategory,
	async (newCategoryId, oldCategoryId) => {
		// Set flag to prevent store watcher from interfering
		isCategorySwitching.value = true;

		// Save current order before switching
		if (oldCategoryId && localItems.value.length > 0) {
			saveItemOrder(oldCategoryId, localItems.value);
		}

		if (newCategoryId) {
			// Fetch items for the new category
			await noteTaskStore.fetchItemsByCategory(newCategoryId);

			// Get the items and apply saved order
			const items = noteTaskStore.getItemsByCategory(newCategoryId);
			const orderedItems = loadItemOrder(newCategoryId, items);
			localItems.value = [...orderedItems];
		} else {
			localItems.value = [];
		}

		// Clear flag after category switch is complete
		isCategorySwitching.value = false;
	},
	{ immediate: true }
);

// Watch for store changes (new items, updates, deletions) but not category switches
watch(
	() => {
		// Only watch store data, not category
		const currentCategory = categoryStore.currentCategory;
		if (!currentCategory) return [];
		return noteTaskStore.getItemsByCategory(currentCategory);
	},
	(newItems) => {
		// Only update if we have a category and the items actually changed
		// BUT don't update if this is a category switch
		if (isCategorySwitching.value) return;

		const orderedItems = loadItemOrder(
			categoryStore.currentCategory,
			newItems
		);
		localItems.value = [...orderedItems];
	},
	{ deep: true }
);

// Watch for changes in local ref and save order
watch(
	localItems,
	(newItems) => {
		saveItemOrder(categoryStore.currentCategory, newItems);
	},
	{ deep: true } // helps watching object, array better
);

const showNoteModal = () => {
	if (categoryStore.currentCategory === null) {
		triggerToast("A category must be selected first!");
		return;
	}
	showModal.value = true;
	modalTitle.value = "Note Title";
};

const showTaskModal = () => {
	if (categoryStore.currentCategory === null) {
		triggerToast("A category must be selected first!");
		return;
	}
	showModal.value = true;
	modalTitle.value = "Task Title";
};

const addItem = async (title) => {
	if (!title?.trim()) {
		triggerToast("Note/Task title cannot be empty!");
		return;
	}
	try {
		const result = await noteTaskStore.addItem({
			type: modalTitle.value === "Note Title" ? "note" : "task",
			title,
			categoryId: categoryStore.currentCategory,
		});
		if (result && result._id && result.type) {
			noteTaskStore.setCurrentItem(result._id, result.type);
		}
		closeModal();
	} catch (e) {
		triggerToast("Failed to add item");
	}
};

const closeModal = () => {
	showModal.value = false;
};

const triggerToast = (message) => {
	toast.error(message, {
		autoClose: 1000,
		position: toast.POSITION.TOP_CENTER,
	});
};

const clearCurrentTargets = () => {
	categoryStore.currentCategory = null;
	noteTaskStore.clearCurrentItem();
};
</script>
