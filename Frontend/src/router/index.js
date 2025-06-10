import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

// Import components
import Login from "../components/Auth/Login.vue";
import Register from "../components/Auth/Register.vue";
import VerifyEmail from "../components/Auth/VerifyEmail.vue";
import App from "../App.vue";

const routes = [
	{
		path: "/",
		component: App,
		meta: { requiresAuth: true },
		children: [
			// Protected routes will be handled by App.vue
		],
	},
	{
		path: "/login",
		name: "Login",
		component: Login,
		meta: { requiresGuest: true },
	},
	{
		path: "/register",
		name: "Register",
		component: Register,
		meta: { requiresGuest: true },
	},
	{
		path: "/verify-email",
		name: "VerifyEmail",
		component: VerifyEmail,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
	const authStore = useAuthStore();
	const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
	const requiresGuest = to.matched.some(
		(record) => record.meta.requiresGuest
	);

	// Initialize auth state from localStorage
	await authStore.initializeAuth();

	if (requiresAuth && !authStore.isAuthenticated) {
		// Redirect to login if trying to access protected route while not authenticated
		next({ name: "Login", query: { redirect: to.fullPath } });
	} else if (requiresGuest && authStore.isAuthenticated) {
		// Redirect to home if trying to access guest route while authenticated
		next({ path: "/" });
	} else {
		next();
	}
});

export default router;
