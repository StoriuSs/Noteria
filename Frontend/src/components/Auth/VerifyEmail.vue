<template>
	<div class="min-h-screen flex items-center justify-center bg-base-300">
		<div class="card w-96 bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-2xl font-bold mb-6">
					Email Verification
				</h2>

				<div v-if="isVerifying" class="text-center">
					<svg
						class="animate-spin h-8 w-8 mx-auto text-primary"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24">
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<p class="mt-4">Verifying your email...</p>
				</div>

				<div
					v-else-if="verificationStatus === 'success'"
					class="text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-16 w-16 mx-auto text-success mb-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<h3 class="text-xl font-semibold mb-2">Email Verified!</h3>
					<p class="mb-4">
						Your email has been successfully verified. You can close
						this tab now.
					</p>
				</div>

				<div
					v-else-if="verificationStatus === 'error'"
					class="text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-16 w-16 mx-auto text-error mb-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<h3 class="text-xl font-semibold mb-2">
						Verification Failed
					</h3>
					<p class="mb-4">{{ errorMessage }}</p>
					<div class="space-y-2">
						<router-link to="/login" class="btn btn-outline w-full">
							Back to Login
						</router-link>
					</div>
				</div>

				<div v-else class="text-center">
					<p class="mb-4">
						Please check your email for the verification link.
					</p>
					<div class="space-y-2">
						<router-link to="/login" class="btn btn-outline w-full">
							Back to Login
						</router-link>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../../stores/authStore";

const route = useRoute();
const authStore = useAuthStore();

const isVerifying = ref(false);
const verificationStatus = ref(null);
const errorMessage = ref("");

const verifyEmail = async (token) => {
	if (!token) {
		// If no token is present, we don't proceed with verification
		verificationStatus.value = null; // Ensure we show the initial message if no token
		return;
	}

	try {
		isVerifying.value = true;
		await authStore.verifyEmail(token);
		verificationStatus.value = "success";
	} catch (error) {
		verificationStatus.value = "error";
		errorMessage.value =
			error.response?.data?.message ||
			"Failed to verify email. Please try again.";
	} finally {
		isVerifying.value = false;
	}
};

// Initial check on mount
onMounted(() => {
	verifyEmail(route.query.token);
});

// Watch for changes in the token query parameter
watch(
	() => route.query.token,
	(newToken) => {
		verifyEmail(newToken);
	}
);
</script>
