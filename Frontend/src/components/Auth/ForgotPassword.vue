<template>
	<div class="min-h-screen flex items-center justify-center bg-base-300">
		<div class="card w-96 bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-2xl font-bold mb-6">
					Forgot Password
				</h2>

				<div v-if="!emailSent">
					<p class="text-sm mb-4">
						Enter your email address and we'll send you a link to
						reset your password.
					</p>
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

						<!-- Submit Button -->
						<div class="form-control mt-6">
							<button
								type="submit"
								class="btn btn-primary"
								:disabled="isLoading">
								{{
									isLoading ? "Sending..." : "Send Reset Link"
								}}
							</button>
						</div>

						<!-- Back to Login -->
						<div class="text-center mt-4">
							<p class="text-sm">
								<router-link
									to="/login"
									class="link link-primary">
									Back to Login
								</router-link>
							</p>
						</div>
					</form>
				</div>

				<div v-else class="text-center space-y-4">
					<div class="flex justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-16 w-16 text-success"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 class="text-xl font-bold">Email Sent!</h3>
					<p class="text-sm">
						We've sent a password reset link to your email address.
						Please check your inbox.
					</p>
					<div class="mt-6">
						<router-link
							to="/login"
							class="btn btn-outline btn-primary">
							Return to Login
						</router-link>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../../stores/authStore";

const authStore = useAuthStore();
const email = ref("");
const isLoading = ref(false);
const emailSent = ref(false);

const handleSubmit = async () => {
	try {
		isLoading.value = true;
		await authStore.requestPasswordReset(email.value);
		emailSent.value = true;
	} catch (error) {
		console.error("Password reset request error:", error);
	} finally {
		isLoading.value = false;
	}
};
</script>
