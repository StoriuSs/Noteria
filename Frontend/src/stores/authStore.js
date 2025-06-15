import { defineStore } from "pinia";
import axios from "axios";
import { toast } from "vue3-toastify";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:8080/api/v1/auth";

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

let isLoggingOut = false;
let isRefreshingToken = false;
let failedRequestsQueue = [];

export const useAuthStore = defineStore("auth", {
	state: () => ({
		user: JSON.parse(localStorage.getItem("user")) || null,
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
			const user = localStorage.getItem("user");
			if (user) {
				this.user = JSON.parse(user);
			}
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
					`${API_URL}/sign-in`,
					{ email, password },
					{ withCredentials: true }
				);
				const { accessToken, user } = response.data.data;
				this.accessToken = accessToken;
				this.user = user;
				this.isAuthenticated = true;
				localStorage.setItem("accessToken", accessToken);
				localStorage.setItem("user", JSON.stringify(user));
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

		async register(userData) {
			try {
				await axios.post(`${API_URL}/sign-up`, userData);
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
					`${API_URL}/verify-email/${token}`,
					{ withCredentials: true }
				);
				toast.success(response.data.message);
				const { accessToken, user } = response.data.data;
				this.accessToken = accessToken;
				this.user = user;
				this.isAuthenticated = true;
				localStorage.setItem("accessToken", accessToken);
				localStorage.setItem("user", JSON.stringify(user));
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
			if (isRefreshingToken) {
				// If already refreshing, wait for the current refresh to complete
				return new Promise((resolve) => {
					failedRequestsQueue.push(resolve);
				});
			}
			isRefreshingToken = true;
			try {
				const response = await axios.post(
					`${API_URL}/refresh-token`,
					{},
					{ withCredentials: true }
				);
				const { accessToken, user } = response.data;
				this.accessToken = accessToken;
				if (user) {
					this.user = user;
					localStorage.setItem("user", JSON.stringify(user));
				}
				localStorage.setItem("accessToken", accessToken);

				axios.defaults.headers.common[
					"Authorization"
				] = `Bearer ${accessToken}`;

				// Resolve all pending requests with the new token
				failedRequestsQueue.forEach((resolve) => resolve(accessToken));
				failedRequestsQueue = []; // Clear the queue

				return accessToken;
			} catch (error) {
				this.logout();
				throw error;
			} finally {
				isRefreshingToken = false;
			}
		},

		async logout() {
			if (isLoggingOut || !this.isAuthenticated) {
				return;
			}
			isLoggingOut = true;
			try {
				if (this.accessToken) {
					await axios.post(
						`${API_URL}/sign-out`,
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
				localStorage.removeItem("user");
				delete axios.defaults.headers.common["Authorization"];
				toast.info("Logged out!");
				isLoggingOut = false;
				failedRequestsQueue = [];
			}
		},
	},
});
