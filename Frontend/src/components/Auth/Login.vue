<template>
	<div class="min-h-screen flex items-center justify-center bg-base-300">
		<div class="card w-96 bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-2xl font-bold mb-6">
					Login to Noteria
				</h2>

				<form @submit.prevent="handleSubmit" class="space-y-4">
					<!-- Email -->
					<div class="form-control">
						<label class="label">
							<span class="label-text">Email</span>
						</label>
						<input
							v-model="email"
							type="email"
							placeholder="Enter your email"
							class="input input-bordered"
							required />
					</div>

					<!-- Password -->
					<div class="form-control">
						<label class="label">
							<span class="label-text">Password</span>
						</label>
						<input
							v-model="password"
							type="password"
							placeholder="Enter your password"
							class="input input-bordered"
							required />
					</div>

					<!-- Submit Button -->
					<div class="form-control mt-6">
						<button
							type="submit"
							class="btn btn-primary"
							:disabled="isLoading">
							{{ isLoading ? "Logging in..." : "Login" }}
						</button>
					</div>

					<!-- Register Link -->
					<div class="text-center mt-4">
						<p class="text-sm">
							Don't have an account?
							<router-link
								to="/register"
								class="link link-primary">
								Register here
							</router-link>
						</p>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const isLoading = ref(false);

const handleSubmit = async () => {
	try {
		isLoading.value = true;
		await authStore.login(email.value, password.value);
		router.push("/"); // Redirect to home page after successful login
	} catch (error) {
		// Error is already handled by the store with toast
		console.error("Login error:", error);
	} finally {
		isLoading.value = false;
	}
};
</script>
