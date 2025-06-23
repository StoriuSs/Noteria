<template>
	<div class="min-h-screen flex items-center justify-center bg-base-300">
		<div class="card w-96 bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-2xl font-bold mb-6">
					Reset Password
				</h2>

				<div v-if="!resetSuccess && !tokenInvalid">
					<p class="text-sm mb-4">Enter your new password below.</p>
					<form @submit.prevent="handleSubmit" class="space-y-4">
						<!-- New Password -->
						<div class="form-control">
							<label class="label">
								<span class="label-text">New Password</span>
							</label>
							<input
								v-model="password"
								type="password"
								placeholder="Enter new password"
								class="input input-bordered"
								required
								minlength="6" />
						</div>

						<!-- Confirm Password -->
						<div class="form-control">
							<label class="label">
								<span class="label-text">Confirm Password</span>
							</label>
							<input
								v-model="confirmPassword"
								type="password"
								placeholder="Confirm new password"
								class="input input-bordered"
								required />
							<label class="label" v-if="passwordMismatch">
								<span class="label-text-alt text-error"
									>Passwords don't match</span
								>
							</label>
						</div>

						<!-- Submit Button -->
						<div class="form-control mt-6">
							<button
								type="submit"
								class="btn btn-primary"
								:disabled="isLoading || passwordMismatch">
								{{
									isLoading
										? "Resetting..."
										: "Reset Password"
								}}
							</button>
						</div>
					</form>
				</div>

				<div v-else-if="resetSuccess" class="text-center space-y-4">
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
					<h3 class="text-xl font-bold">
						Password Reset Successful!
					</h3>
					<p class="text-sm">
						Your password has been successfully reset. You can now
						login with your new password.
					</p>
					<div class="mt-6">
						<router-link
							to="/login"
							class="btn btn-outline btn-primary">
							Login
						</router-link>
					</div>
				</div>

				<div v-else class="text-center space-y-4">
					<div class="flex justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-16 w-16 text-error"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 class="text-xl font-bold">Invalid or Expired Link</h3>
					<p class="text-sm">
						The password reset link is invalid or has expired.
						Please request a new password reset link.
					</p>
					<div class="mt-6">
						<router-link
							to="/forgot-password"
							class="btn btn-outline btn-primary">
							Request New Link
						</router-link>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const token = ref("");
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const resetSuccess = ref(false);
const tokenInvalid = ref(false);

const passwordMismatch = computed(() => {
	return (
		password.value &&
		confirmPassword.value &&
		password.value !== confirmPassword.value
	);
});

onMounted(() => {
	token.value = route.query.token;
	if (!token.value) {
		tokenInvalid.value = true;
	} else {
		// Verify token validity
		verifyToken();
	}
});

const verifyToken = async () => {
	try {
		isLoading.value = true;
		await authStore.verifyResetToken(token.value);
		isLoading.value = false;
	} catch (error) {
		console.error("Token verification error:", error);
		tokenInvalid.value = true;
		isLoading.value = false;
	}
};

const handleSubmit = async () => {
	if (passwordMismatch.value) return;

	try {
		isLoading.value = true;
		await authStore.resetPassword(token.value, password.value);
		resetSuccess.value = true;
	} catch (error) {
		console.error("Password reset error:", error);
	} finally {
		isLoading.value = false;
	}
};
</script>
