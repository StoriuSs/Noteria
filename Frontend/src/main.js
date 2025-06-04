import "./assets/main.css";
import Vue3Toasity from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import App from "./App.vue";

const app = createApp(App);
app.component("QuillEditor", QuillEditor);
app.use(createPinia());
app.use(Vue3Toasity, {
	autoClose: 3000,
});
app.mount("#app");
