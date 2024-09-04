<template>
	<div class="flex flex-col gap-4">
		<h2 class="text-2xl font-semibold text-ls-900 dark:text-ds-200">User Account</h2>
		<p class="mb-4 text-ls-500 dark:text-ds-400">
			Please choose a username and password.
		</p>
		<InputText data-cy="create-username" v-model="username" id="username" name="username" autocomplete="username"
			label="Username" required />
		<InputText data-cy="create-password" v-model="password" id="password" name="password" autocomplete="password"
			label="Password" required password />
		<InputText data-cy="create-password-confirm" v-model="passwordConfirm" id="passwordConfirm"
			name="passwordConfirm" autocomplete="password" label="Confirm password" required password />
		<p v-if="passwordMismatch" class="text-red-600 dark:text-red-500 text-sm py-2">
			The passwords do not match.
		</p>
		<Button data-cy="submit-user" label="Next" size="xl" :disabled="!validate()" @click="proceed" class="mt-8" />
	</div>
</template>

<script setup lang="ts">
import Button from "@/components/basic/Button.vue";
import InputText from "@/components/basic/InputText.vue";
import { useUsersStore } from "@/stores/users";
import { computed, ref } from "vue";

const users = useUsersStore();

const username = ref("");
const password = ref("");
const passwordConfirm = ref("");

const passwordMismatch = computed(() => {
	return password.value && passwordConfirm.value && password.value !== passwordConfirm.value;
});

function validate() {
	return !!username.value && !!password.value && password.value === passwordConfirm.value;
}

function proceed() {
	const newUser = { name: username.value, password: password.value, admin: true };
	users.create(newUser);
}
</script>
