import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
	state: () => ({
		isDark:
			localStorage.getItem("theme") === "dark" ||
			(!localStorage.getItem("theme") &&
				window.matchMedia("(prefers-color-scheme: dark)").matches),
	}),

	getters: {
		currentTheme: (state) => (state.isDark ? "dark" : "light"),
		isDarkMode: (state) => state.isDark,
	},

	actions: {
		toggleTheme() {
			this.isDark = !this.isDark;
			this.applyTheme();
		},

		setTheme(theme) {
			this.isDark = theme === "dark";
			this.applyTheme();
		},

		applyTheme() {
			// Save to localStorage
			localStorage.setItem("theme", this.currentTheme);

			// Apply to document
			if (this.isDark) {
				document.documentElement.setAttribute("data-theme", "dark");
			} else {
				document.documentElement.setAttribute("data-theme", "light");
			}
		},

		// Initialize theme on app startup
		initializeTheme() {
			this.applyTheme();
		},
	},
});
