<template>
	<aside
		class="h-full p-4 flex flex-col transition-all duration-300"
		:class="collapsed ? 'w-14 min-w-0' : 'w-1/6 min-w-[220px]'">
		<div class="flex items-center mb-6 gap-1">
			<img
				v-if="!collapsed"
				src="../../assets/img/notes.png"
				alt="Logo" />
			<span
				v-if="!collapsed"
				class="font-bold text-xl tracking-wide mr-auto"
				>NOTERIA</span
			>
			<img
				src="../../assets/img/hide.png"
				alt="Collapse-icon"
				class="cursor-pointer transition-transform"
				@click="toggleCollapse" />
		</div>

		<!-- Sidebar content -->
		<div v-if="!collapsed" class="flex flex-col flex-1 min-h-0">
			<input
				class="input input-bordered w-full mb-4"
				placeholder="Search note" />
			<button
				class="btn btn-primary w-full mb-4"
				@click="showAddModal = true">
				+ Category
			</button>
			<VueDraggable
				tag="div"
				ref="el"
				class="flex-1 overflow-y-auto"
				:animation="200">
				<div
					class="mb-1.5"
					v-for="category in categories"
					:key="category.id">
					<div
						class="tooltip w-full"
						:data-tip="`${
							noteTaskStore.getItemsByCategory(category.id).length
						} item(s) | ${category.updatedAt}`">
						<button
							class="btn btn-ghost w-full flex justify-start category-button"
							:style="{
								'background-color':
									currentCategory === category.id
										? '#304262'
										: 'transparent',
							}"
							@click="setCurrentCategory(category.id)">
							<span
								class="flex items-center w-full flex-1 category-content">
								<span
									class="inline-block flex-shrink-0 w-4 h-4 rounded-full mr-2"
									:style="{
										'background-color': category.color,
									}"></span>
								<span
									class="text-left overflow-hidden text-ellipsis whitespace-nowrap"
									>{{ category.name }}</span
								>
							</span>
							<!-- Edit Icon -->
							<svg
								@click="openEditModal(category)"
								class="feather feather-edit ml-auto edit-icon"
								fill="none"
								height="24"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								viewBox="0 0 24 24"
								width="24"
								xmlns="http://www.w3.org/2000/svg">
								<path
									d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
								<path
									d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
							</svg>
						</button>
					</div>
				</div>
			</VueDraggable>
		</div>
		<!-- Add Category Modal -->
		<div
			v-if="showAddModal"
			class="fixed inset-0 flex items-center justify-center z-50">
			<AddCategoryModal
				@add="addCategory"
				@close="closeAddModal"></AddCategoryModal>
		</div>

		<!-- Edit Category Modal -->
		<div
			v-else-if="showEditModal"
			class="fixed inset-0 flex items-center justify-center z-50">
			<EditCategoryModal
				v-if="showEditModal"
				:category="editingCategory"
				@edit="editCategory"
				@close="closeEditModal"
				@delete="deleteCategory" />
		</div>
	</aside>
</template>

<script setup>
import { ref, computed } from "vue";
import { useCategoryStore } from "../../stores/categoryStore";
import { useNoteTaskStore } from "../../stores/noteTaskStore";
import AddCategoryModal from "../Modals/AddCategoryModal.vue";
import EditCategoryModal from "../Modals/EditCategoryModal.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { VueDraggable } from "vue-draggable-plus";

const collapsed = ref(false);
function toggleCollapse() {
	collapsed.value = !collapsed.value;
}

const showAddModal = ref(false);
const showEditModal = ref(false);
const editingCategory = ref(null);
const categoryStore = useCategoryStore();
const noteTaskStore = useNoteTaskStore();
const categories = categoryStore.getCategories;
const currentCategory = computed(() => categoryStore.currentCategory);

function addCategory({ name, color }) {
	if (!name.trim()) {
		triggerToast("Category name cannot be empty!");
		return;
	}
	categoryStore.addCategory(name, color);
	categoryStore.setCurrentCategory(categoryStore.categories[0].id);
	closeAddModal();
}

function closeAddModal() {
	showAddModal.value = false;
}

function setCurrentCategory(categoryId) {
	categoryStore.setCurrentCategory(categoryId);
}

function openEditModal(category) {
	editingCategory.value = { ...category };
	showEditModal.value = true;
}

function closeEditModal() {
	showEditModal.value = false;
	editingCategory.value = null;
}

function editCategory({ id, name, color }) {
	if (!name.trim()) {
		triggerToast("Category name cannot be empty!");
		return;
	}
	categoryStore.updateCategory(id, { name, color });
	closeEditModal();
	triggerSuccessToast("Category updated successfully!");
}

function deleteCategory(id) {
	if (
		!confirm(
			"WARNING! This category along with all its items will be deleted. Are you sure?"
		)
	) {
		return;
	}
	categoryStore.deleteCategory(id);
	closeEditModal();
	triggerSuccessToast("Category deleted successfully!");
}

const triggerToast = (message) => {
	toast.error(message, {
		autoClose: 1000,
		position: toast.POSITION.TOP_CENTER,
	});
};

const triggerSuccessToast = (message) => {
	toast.success(message, {
		autoClose: 1000,
		position: toast.POSITION.TOP_CENTER,
	});
};
</script>

<style>
/* Hide the edit icon */
.edit-icon {
	opacity: 0;
	transition: opacity 0.2s ease;
}

/* Show the edit icon on hover */
.category-button:hover .edit-icon {
	opacity: 1;
}

/* Shrink the content span when hovering the button so that the icon is visible*/
.category-button:hover .category-content {
	width: 80%;
}

/* Dragging */
.sortable-chosen {
	color: #fff;
	box-shadow: 0 8px 32px 0 #2563eb99;
	opacity: 1;
	z-index: 100;
	border-radius: 0.5rem;
	transform: scale(1.04);
	transition: box-shadow 0.2s, background 0.2s, opacity 0.2s, transform 0.2s;
	border: 2px solid #60a5fa;
}

.sortable-ghost {
	border-radius: 0.5rem;
	min-height: 44px;
	opacity: 0.7;
	margin-bottom: 0.375rem;
	transition: background 0.2s, opacity 0.2s;
	border: 2px dashed #f59e42;
}

/* Hide tooltip when dragging */
.sortable-chosen .tooltip::before,
.sortable-chosen .tooltip::after {
	display: none !important;
}
</style>
