<template>
	<section class="h-full p-4 flex flex-col bg-base-100">
		<input
			class="input input-bordered w-full mb-4"
			placeholder="Search in note content" />
		<div class="flex gap-2 mb-4">
			<button class="btn btn-info flex-1" @click="showNoteModal">
				+ Note
			</button>
			<button class="btn btn-secondary flex-1" @click="showTaskModal">
				+ Task
			</button>
		</div>
		<VueDraggable
			tag="div"
			ref="el"
			class="flex-1 overflow-y-auto"
			:animation="200"
			v-model="localItems">
			<div v-for="item in localItems" :key="item._id" class="mb-1.5">
				<div
					class="tooltip w-full"
					:data-tip="`${item.type} | ${item.updatedAt}`">
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
import { ref, computed, watch, onMounted } from "vue";
import BaseModal from "../Modals/BaseModal.vue";
import { useCategoryStore } from "../../stores/categoryStore";
import { useNoteTaskStore } from "../../stores/noteTaskStore";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { VueDraggable } from "vue-draggable-plus";

const showModal = ref(false);
const modalTitle = ref("");
const categoryStore = useCategoryStore();
const noteTaskStore = useNoteTaskStore();

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
				orderedItems.push(item);
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

// Watch for changes in the store and update local ref
watch(
	() => noteTaskStore.getItemsByCategory(categoryStore.currentCategory),
	(newItems) => {
		// Apply saved order when loading items
		const orderedItems = loadItemOrder(
			categoryStore.currentCategory,
			newItems
		);
		localItems.value = [...orderedItems];
	},
	{ immediate: true }
);

// Watch for changes in local ref and save order
watch(
	localItems,
	(newItems) => {
		saveItemOrder(categoryStore.currentCategory, newItems);
	},
	{ deep: true }
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
		await noteTaskStore.addItem({
			type: modalTitle.value === "Note Title" ? "note" : "task",
			title,
			categoryId: categoryStore.currentCategory,
		});
		const items = noteTaskStore.getItemsByCategory(
			categoryStore.currentCategory
		);
		if (items.length > 0) {
			noteTaskStore.setCurrentItem(items[0].id, items[0].type);
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
</script>
