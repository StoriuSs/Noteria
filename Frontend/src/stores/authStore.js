import { defineStore } from "pinia";
import axios from "axios";
import { toast } from "vue3-toastify";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:8080/api/v1";

// Helper to check if access token is expired
function isAccessTokenExpired(token) {
	if (!token) return true;
	try {
		const { exp } = jwtDecode(token);
		return Date.now() >= exp * 1000;
	} catch {
		return true;
	}
}

// Add a flag to prevent multiple logout calls and refresh-token calls
let isLoggingOut = false;
let isRefreshingToken = false;

export const useAuthStore = defineStore("auth", {
	state: () => ({
		user: null,
		accessToken: localStorage.getItem("accessToken") || null,
		isAuthenticated: !!localStorage.getItem("accessToken"),
	}),

	getters: {
		getUser: (state) => state.user,
		getAccessToken: (state) => state.accessToken,
		isLoggedIn: (state) => state.isAuthenticated,
	},

	actions: {
		// Initialize auth state from localStorage
		async initializeAuth() {
			const accessToken = localStorage.getItem("accessToken");
			if (accessToken) {
				// Check if access token is expired
				if (isAccessTokenExpired(accessToken)) {
					try {
						// Try to refresh
						await this.refreshAccessToken();
						this.isAuthenticated = true;
					} catch (error) {
						// Refresh failed (refresh token expired or invalid)
						this.logout();
					}
				} else {
					this.accessToken = accessToken;
					this.isAuthenticated = true;
					axios.defaults.headers.common[
						"Authorization"
					] = `Bearer ${accessToken}`;
				}
			}
		},

		async login(email, password) {
			try {
				const response = await axios.post(
					`${API_URL}/auth/sign-in`,
					{ email, password },
					{ withCredentials: true }
				);
				const { accessToken, user } = response.data.data;
				this.accessToken = accessToken;
				this.user = user;
				this.isAuthenticated = true;
				localStorage.setItem("accessToken", accessToken);
				axios.defaults.headers.common[
					"Authorization"
				] = `Bearer ${accessToken}`;
				toast.success("Login successful!");
				return true;
			} catch (error) {
				toast.error(error.response?.data?.message || "Login failed");
				throw error;
			}
		},

		// Only show a success message, do not set tokens or isAuthenticated until verified
		async register(userData) {
			try {
				await axios.post(`${API_URL}/auth/sign-up`, userData);
				toast.success(
					"Registration successful! Please check your email to verify your account."
				);
				return true;
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Registration failed"
				);
				throw error;
			}
		},

		async verifyEmail(token) {
			try {
				const response = await axios.get(
					`${API_URL}/auth/verify-email/${token}`,
					{ withCredentials: true }
				);
				toast.success(response.data.message);
				const { accessToken, user } = response.data.data;
				this.accessToken = accessToken;
				this.user = user;
				this.isAuthenticated = true;
				localStorage.setItem("accessToken", accessToken);
				axios.defaults.headers.common[
					"Authorization"
				] = `Bearer ${accessToken}`;
				return true;
			} catch (error) {
				toast.error(
					error.response?.data?.message || "Email verification failed"
				);
				throw error;
			}
		},

		async refreshAccessToken() {
			// prevent multiple simultaneous refresh calls
			if (isRefreshingToken || !this.isAuthenticated) {
				return;
			}
			isRefreshingToken = true;
			try {
				const response = await axios.post(
					`${API_URL}/auth/refresh-token`,
					{},
					{ withCredentials: true }
				);
				const { accessToken } = response.data;
				this.accessToken = accessToken;
				localStorage.setItem("accessToken", accessToken);
				axios.defaults.headers.common[
					"Authorization"
				] = `Bearer ${accessToken}`;
				return accessToken;
			} catch (error) {
				this.logout();
				throw error;
			} finally {
				isRefreshingToken = false; // reset the flag
			}
		},

		async logout() {
			// prevent multiple simultaneous logout calls
			if (isLoggingOut || !this.isAuthenticated) {
				return;
			}
			isLoggingOut = true;
			try {
				if (this.accessToken) {
					await axios.post(
						`${API_URL}/auth/sign-out`,
						{},
						{
							headers: {
								Authorization: `Bearer ${this.accessToken}`,
							},
							withCredentials: true,
						}
					);
				}
			} catch (error) {
				console.error("Logout error:", error);
			} finally {
				this.user = null;
				this.accessToken = null;
				this.isAuthenticated = false;
				localStorage.removeItem("accessToken");
				delete axios.defaults.headers.common["Authorization"];
				toast.info("Logged out!");
				isLoggingOut = false; // Reset the flag
			}
		},
	},
});
