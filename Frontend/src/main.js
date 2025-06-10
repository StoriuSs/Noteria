import "./assets/main.css";
import Vue3Toasity from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// Register components
app.component("QuillEditor", QuillEditor);

// Use plugins
app.use(createPinia());
app.use(router);
app.use(Vue3Toasity, {
	autoClose: 3000,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
	draggablePercent: 0.6,
	hideProgressBar: false,
	closeButton: true,
	icon: true,
	rtl: false,
	// Prevent toasts from being cleared on component unmount
	clearOnUrlChange: false,
	// Keep toasts alive during navigation
	limit: 5,
});

app.mount("#app");
