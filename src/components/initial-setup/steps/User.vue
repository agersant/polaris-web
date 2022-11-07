<template>
	<div>
		<h2>User Account</h2>
		<p class="explanation">Please choose a username and a password you would like to use to sign in to Polaris.</p>
		<form v-on:submit.prevent="proceed">
			<div class="field">
				<label for="username">Username</label>
				<input id="username" type="text" data-cy="create-username" v-model="username" />

				<label for="password">Password</label>
				<input id="password" type="password" data-cy="create-password" v-model="password" />

				<label for="password-confirm">Confirm password</label>
				<input id="password-confirm" type="password" data-cy="create-password-confirm"
					v-model="passwordConfirm" />
				<p v-if="password && passwordConfirm && password !== passwordConfirm" class="tip error">The passwords do
					not match.</p>
			</div>
			<button data-cy="submit-user" class="submit" v-bind:disabled="!validate()"
				v-bind:submit="true">Next</button>
		</form>
	</div>
</template>

<script setup lang="ts">
import { useUsersStore } from "@/stores/users";
import { ref } from "vue";

const users = useUsersStore();

const username = ref("");
const password = ref("");
const passwordConfirm = ref("");

function validate() {
	return !!username.value && !!password.value && password.value === passwordConfirm.value;
}

function proceed() {
	const newUser = { name: username.value, password: password.value, admin: true };
	users.create(newUser);
}
</script>
