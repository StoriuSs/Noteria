<template>
	<div
		v-if="isLoading"
		class="flex h-screen items-center justify-center bg-base-300">
		<div class="loading loading-spinner loading-lg"></div>
	</div>
	<!-- If not authenticated OR if on the verify-email page, always show router-view -->
	<router-view
		v-else-if="!isAuthenticated || isVerifyEmailRoute"></router-view>
	<!-- Otherwise, if authenticated and not on verify-email, show the main app -->
	<div v-else class="flex h-screen bg-base-300">
		<!-- Sidebar -->
		<CategoryList class="border-r border-base-200" />
		<!-- Notes/Tasks List -->
		<NoteTaskList class="w-1/5 min-w-[260px] border-r border-base-200" />
		<!-- Main Content Area -->
		<div v-if="type === 'note'" class="flex-1">
			<NoteEditor class="flex-1" />
		</div>
		<div v-else-if="type === 'task'" class="flex-1">
			<TaskEditor class="flex-1" />
		</div>
		<div v-else class="flex-1">
			<div class="flex-1">
				<Welcome class="flex-1" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, watch, ref, onMounted, onUnmounted } from "vue"; // Add onUnmounted
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "./stores/authStore";
import { useCategoryStore } from "./stores/categoryStore";
import { useNoteTaskStore } from "./stores/noteTaskStore";
import CategoryList from "./components/Layout/CategoryList.vue";
import NoteTaskList from "./components/Layout/NoteTaskList.vue";
import Welcome from "./components/Layout/Welcome.vue";
import NoteEditor from "./components/Layout/NoteEditor.vue";
import TaskEditor from "./components/Layout/TaskEditor.vue";

const router = useRouter();
const authStore = useAuthStore();
const categoryStore = useCategoryStore();
const noteTaskStore = useNoteTaskStore();
const route = useRoute();

const isLoading = ref(true);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const type = computed(() => noteTaskStore.currentItemType);

const isVerifyEmailRoute = computed(() => route.name === "VerifyEmail");

// Function to handle storage events from other tabs
const handleStorageChange = (event) => {
	// Only act if the 'accessToken' in localStorage changes
	// Calling initializeAuth() will re-read localStorage and update the store's reactive state for other tabs as well
	if (event.key === "accessToken") {
		console.log(
			"Storage event detected. Re-initializing auth from App.vue."
		);
		authStore.initializeAuth(); // This updates the reactive isAuthenticated computed property
	}
};

// Initialize authentication and fetch all data needed to Pinia stores on app mount
onMounted(async () => {
	try {
		await authStore.initializeAuth();
		if (authStore.isAuthenticated) {
			await categoryStore.fetchCategories();
			await noteTaskStore.fetchAllItems();
		}
	} catch (error) {
		console.error("Auth initialization failed:", error);
	} finally {
		isLoading.value = false;
	}
	// Add the storage event listener when the component mounts
	window.addEventListener("storage", handleStorageChange);
});

// Remove storage event listener when the component unmounts
onUnmounted(() => {
	window.removeEventListener("storage", handleStorageChange);
});

// Watcher for authentication changes (only after initial load, or forced by storage event)
watch(isAuthenticated, (newVal) => {
	// Scenario 1: User becomes UNAUTHENTICATED and is not on login/verify-email
	if (
		!isLoading.value &&
		!newVal && // isAuthenticated becomes false
		router.currentRoute.value.path !== "/login" &&
		router.currentRoute.value.name !== "VerifyEmail"
	) {
		router.push("/login");
	}

	// Scenario 2: User becomes AUTHENTICATED while on the VerifyEmail page AND without a token
	// This condition specifically targets the "first tab"
	if (
		!isLoading.value &&
		newVal &&
		router.currentRoute.value.name === "VerifyEmail" &&
		!router.currentRoute.value.query.token // NO token in the URL (it's the first tab)
	) {
		console.log(
			"Redirecting first tab to / after verification in another tab."
		);
		router.push("/");
	}
});
</script>
