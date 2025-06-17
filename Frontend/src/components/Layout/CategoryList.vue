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
			<!-- Tooltip has been removed for now, could be back in the future if I change my mind -->
			<VueDraggable
				tag="div"
				ref="el"
				class="flex-1 overflow-y-auto"
				:animation="200"
				v-model="categoryStore.categories"
				@update="onDragUpdate">
				<div
					class="mb-1.5"
					v-for="category in categoryStore.getCategories"
					:key="category._id">
					<div class="tooltip w-full">
						<button
							class="btn btn-ghost w-full flex justify-start category-button"
							:data-category-id="category._id"
							:style="{
								'background-color':
									currentCategory === category._id
										? '#304262'
										: 'transparent',
							}"
							@click="setCurrentCategory(category._id)">
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

			<!-- User Menu -->
			<div class="mt-4 dropdown dropdown-top self-baseline">
				<button
					class="btn btn-soft btn-primary btn-circle avatar w-full">
					<div class="w-10 rounded-full">
						<!-- User Icon -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 m-2"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
				</button>
				<ul
					class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
					<li>
						<button @click="handleLogout" class="text-error">
							<!-- Logout Icon -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 mr-2"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							Logout
						</button>
					</li>
				</ul>
			</div>
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
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";
import { useCategoryStore } from "../../stores/categoryStore";
import { useNoteTaskStore } from "../../stores/noteTaskStore";
import AddCategoryModal from "../Modals/AddCategoryModal.vue";
import EditCategoryModal from "../Modals/EditCategoryModal.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { VueDraggable } from "vue-draggable-plus";

const router = useRouter();
const authStore = useAuthStore();
const collapsed = ref(false);
function toggleCollapse() {
	collapsed.value = !collapsed.value;
}

const showAddModal = ref(false);
const showEditModal = ref(false);
const editingCategory = ref(null);
const categoryStore = useCategoryStore();
const noteTaskStore = useNoteTaskStore();
const currentCategory = computed(() => categoryStore.currentCategory);

const handleLogout = async () => {
	if (confirm("Do you want to logout?")) {
		await authStore.logout();
		router.push("/login");
	}
};

async function addCategory({ name, color }) {
	if (!name.trim()) {
		triggerToast("Category name cannot be empty!");
		return;
	}
	await categoryStore.addCategory(name, color);
	categoryStore.setCurrentCategory(categoryStore.categories[0]._id);
	closeAddModal();
}

function closeAddModal() {
	showAddModal.value = false;
}

function setCurrentCategory(categoryId) {
	categoryStore.setCurrentCategory(categoryId);
}

function openEditModal(category) {
	editingCategory.value = category;
	showEditModal.value = true;
}

function closeEditModal() {
	showEditModal.value = false;
	editingCategory.value = null;
}

function editCategory({ _id, name, color }) {
	if (!_id) {
		triggerToast("Category ID is missing! Cannot update.");
		return;
	}
	if (!name.trim()) {
		triggerToast("Category name cannot be empty!");
		return;
	}
	categoryStore.updateCategory(_id, { name, color });
	closeEditModal();
}

function deleteCategory(payload) {
	const _id = typeof payload === "object" ? payload._id : payload;
	if (!_id) {
		triggerToast("Category ID is missing! Cannot delete.");
		return;
	}
	if (
		!confirm(
			"WARNING! This category along with all its items will be deleted. Are you sure?"
		)
	) {
		return;
	}
	noteTaskStore.deleteItemsByCategory(_id); // Delete all items in this category
	categoryStore.deleteCategory(_id);
	noteTaskStore.clearCurrentItem(); // Clear the editor if the current item is deleted
	closeEditModal();
}

const triggerToast = (message) => {
	toast.error(message);
};

const onDragUpdate = () => {
	// Save the new order to localStorage
	console.log("Dragged!");
	console.log("Sorted categories:", categoryStore.categories);
	categoryStore.saveCategoryOrder(categoryStore.categories);
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
