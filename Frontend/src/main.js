import "./assets/main.css";
import Vue3Toasity from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { toast } from "vue3-toastify";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import App from "./App.vue";
import router from "./router";
import axios from "axios";
import { useAuthStore } from "./stores/authStore";

const pinia = createPinia();

// Hydrate auth store before app creation
const tempApp = createApp({});
tempApp.use(pinia);
const authStore = useAuthStore();
authStore.initializeAuth();

const app = createApp(App);

// Register components
app.component("QuillEditor", QuillEditor);

// Use plugins
app.use(createPinia());
app.use(router);
app.use(Vue3Toasity, {
	autoClose: 2500,
	position: toast.POSITION.TOP_CENTER,
	closeOnClick: true,
	pauseOnHover: true,
	hideProgressBar: false,
	closeButton: true,
	icon: true,
	rtl: false,
	// Prevent toasts from being cleared on component unmount
	clearOnUrlChange: false,
	// Keep toasts alive during navigation
	limit: 5,
});

axios.interceptors.response.use(
	(response) => response, // If the response is good, just return it
	async (error) => {
		const authStore = useAuthStore();
		const originalRequest = error.config;

		// Check if the error is 401 Unauthorized and it's not a refresh token request itself
		if (error.response?.status === 401 && !originalRequest._isRetry) {
			originalRequest._isRetry = true; // Mark this request as retried to prevent infinite loops

			try {
				// Attempt to refresh the token
				await authStore.refreshAccessToken();

				// If refresh is successful, update the Authorization header for the original request
				originalRequest.headers[
					"Authorization"
				] = `Bearer ${authStore.accessToken}`;

				// Retry the original request with the new token
				return axios(originalRequest);
			} catch (refreshError) {
				authStore.logout();
				return Promise.reject(refreshError);
			}
		}

		// For any other error, or if it's already a retried request, just reject the promise
		return Promise.reject(error);
	}
);

app.mount("#app");
