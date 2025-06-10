<template>
	<div class="min-h-screen flex items-center justify-center bg-base-300">
		<div class="card w-96 bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-2xl font-bold mb-6">
					Create an Account
				</h2>

				<form @submit.prevent="handleSubmit" class="space-y-4">
					<!-- Username -->
					<div class="form-control">
						<label class="label">
							<span class="label-text">Username</span>
						</label>
						<input
							v-model="username"
							type="text"
							placeholder="Enter your username"
							class="input input-bordered"
							required />
					</div>

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
							required
							minlength="6" />
						<label class="label">
							<span class="label-text-alt"
								>Password must be at least 6 characters</span
							>
						</label>
					</div>

					<!-- Confirm Password -->
					<div class="form-control">
						<label class="label">
							<span class="label-text">Confirm Password</span>
						</label>
						<input
							v-model="confirmPassword"
							type="password"
							placeholder="Confirm your password"
							class="input input-bordered"
							required />
						<label class="label" v-if="passwordMismatch">
							<span class="label-text-alt text-error"
								>Passwords do not match</span
							>
						</label>
					</div>

					<!-- Submit Button -->
					<div class="form-control mt-6">
						<button
							type="submit"
							class="btn btn-primary"
							:disabled="isLoading || passwordMismatch">
							{{ isLoading ? "Creating Account..." : "Register" }}
						</button>
					</div>

					<!-- Login Link -->
					<div class="text-center mt-4">
						<p class="text-sm">
							Already have an account?
							<router-link to="/login" class="link link-primary">
								Login here
							</router-link>
						</p>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);

const passwordMismatch = computed(() => {
	return (
		password.value &&
		confirmPassword.value &&
		password.value !== confirmPassword.value
	);
});

const handleSubmit = async () => {
	if (passwordMismatch.value) return;

	try {
		isLoading.value = true;
		await authStore.register({
			username: username.value,
			email: email.value,
			password: password.value,
			confirm_password: confirmPassword.value,
		});
		router.push("/verify-email"); // Redirect to verification page
	} catch (error) {
		// Error is already handled by the store with toast
		console.error("Registration error:", error);
	} finally {
		isLoading.value = false;
	}
};
</script>
