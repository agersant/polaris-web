<template>
	<Step title="User Account" description="Please choose a username and password.">
		<InputText v-model="username" id="username" name="username" autocomplete="username" label="Username" required />
		<InputText v-model="password" id="password" name="password" autocomplete="password" label="Password" required
			password />
		<InputText v-model="passwordConfirm" id="passwordConfirm" name="passwordConfirm" autocomplete="password"
			label="Confirm password" required password />
		<p v-if="passwordMismatch" class="text-red-600 dark:text-red-500 text-sm py-2">
			The passwords do not match.
		</p>
		<Button label="Next" size="xl" :disabled="!validate()" @click="proceed" class="mt-8" />
	</Step>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import Button from "@/components/basic/Button.vue";
import InputText from "@/components/basic/InputText.vue";
import Step from "@/components/initial-setup/Step.vue";
import { useUsersStore } from "@/stores/users";

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
