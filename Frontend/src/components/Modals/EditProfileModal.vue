<template>
	<div class="bg-[#34496C] p-8 rounded-lg shadow-lg max-w-md w-full">
		<h2 class="text-blue-200 text-2xl font-bold mb-6">Edit Profile</h2>

		<form @submit.prevent="handleSubmit" class="space-y-4">
			<!-- Username -->
			<div>
				<label class="block text-blue-200 text-lg mb-2"
					>Username:</label
				>
				<input
					v-model="username"
					type="text"
					:placeholder="user.username"
					class="input input-bordered w-full mb-4" />
			</div>

			<h3 class="text-blue-200 text-lg font-semibold pt-2 mb-2">
				Change Password
			</h3>
			<!-- Current Password -->
			<div>
				<label class="block text-blue-200 text-lg mb-2"
					>Current Password:</label
				>
				<input
					v-model="currentPassword"
					type="password"
					placeholder="Enter current password"
					class="input input-bordered w-full mb-2" />
			</div>

			<!-- New Password -->
			<div>
				<label class="block text-blue-200 text-lg mb-2"
					>New Password:</label
				>
				<input
					v-model="newPassword"
					type="password"
					placeholder="Enter new password"
					class="input input-bordered w-full mb-2"
					minlength="6" />
				<p
					v-if="newPassword && newPassword.length < 6"
					class="text-sm text-blue-300 mb-2">
					Password must be at least 6 characters
				</p>
			</div>

			<!-- Confirm New Password -->
			<div>
				<label class="block text-blue-200 text-lg mb-2"
					>Confirm New Password:</label
				>
				<input
					v-model="confirmPassword"
					type="password"
					placeholder="Confirm new password"
					class="input input-bordered w-full mb-2" />
				<p v-if="passwordMismatch" class="text-sm text-red-400 mb-2">
					Passwords do not match
				</p>
			</div>
			<!-- Action Buttons -->
			<div class="flex justify-end gap-3 mt-6">
				<button
					type="submit"
					class="btn btn-accent"
					:disabled="
						isSubmitting ||
						passwordMismatch ||
						(hasPasswordChanges && isPasswordIncomplete) ||
						(!username && !hasPasswordChanges)
					">
					{{ isSubmitting ? "Updating..." : "Save Changes" }}
				</button>
				<button
					type="button"
					class="btn btn-outline btn-warning"
					@click="$emit('close')">
					Cancel
				</button>
			</div>
		</form>
	</div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "../../stores/authStore";
import { toast } from "vue3-toastify";

const emit = defineEmits(["close"]);
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const username = ref("");
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const isSubmitting = ref(false);

const passwordMismatch = computed(() => {
	return (
		newPassword.value &&
		confirmPassword.value &&
		newPassword.value !== confirmPassword.value
	);
});

// Check if the user is attempting to change password
const hasPasswordChanges = computed(() => {
	return currentPassword.value || newPassword.value || confirmPassword.value;
});

const isPasswordIncomplete = computed(() => {
	// If user is attempting to change password, require all password fields
	if (hasPasswordChanges.value) {
		return (
			!currentPassword.value ||
			!newPassword.value ||
			!confirmPassword.value
		);
	}
	return false;
});

const handleSubmit = async () => {
	// If no changes were made, just close the modal
	if (!username.value && !hasPasswordChanges.value) {
		emit("close");
		return;
	}

	// Validate passwords if changing password
	if (hasPasswordChanges.value) {
		if (isPasswordIncomplete.value) {
			toast.error("Please fill all password fields");
			return;
		}
		if (passwordMismatch.value) {
			toast.error("New passwords do not match");
			return;
		}
		if (newPassword.value.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}
	}

	try {
		isSubmitting.value = true;
		// Prepare update data
		const updateData = {};
		let hasChanges = false;

		if (username.value && username.value !== user.value.username) {
			updateData.username = username.value;
			hasChanges = true;
		}

		if (currentPassword.value && newPassword.value) {
			updateData.currentPassword = currentPassword.value;
			updateData.newPassword = newPassword.value;
			hasChanges = true;
		}

		if (!hasChanges) {
			toast.info("No changes to save");
			emit("close");
			return;
		}

		await authStore.updateProfile(updateData);
		emit("close");
	} catch (error) {
		// Error already handled in store with toast
		console.error("Profile update error:", error);
	} finally {
		isSubmitting.value = false;
	}
};
</script>
