<template>
	<form v-if="users" v-on:submit.prevent>
		<label>Users</label>
		<ul>
			<li v-for="(user, index) in users.listing" v-bind:key="index">
				<User v-bind:user="user" />
			</li>
		</ul>

		<button v-if="!newUser" v-on:click="beginCreateUser" data-cy="begin-create-user">New user</button>
		<form v-if="newUser" v-on:submit.prevent="endCreateUser">
			<label>Create User</label>
			<div class="field">
				<label for="name">Username</label>
				<input id="name" type="text" v-model="newUser.name" placeholder="" data-cy="new-user-name" />
				<label for="password">Password</label>
				<p v-if="!validatePassword(newUser.password)" class="tip error">The password cannot be blank.</p>
				<input id="password" type="password" autocomplete="new-password" v-model="newUser.password"
					placeholder="" data-cy="new-user-password" />
				<button class="submit" v-bind:disabled="!validateNewUser()" submit="true" v-on:click="endCreateUser"
					data-cy="end-create-user">Create user</button>
			</div>
		</form>
	</form>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref } from "vue";
import { NewUser } from "@/api/dto";
import { useUsersStore } from "@/stores/users";
import User from "@/components/settings/sections/User.vue";

const newUser: Ref<NewUser | null> = ref(null);

const users = useUsersStore();

onMounted(() => {
	users.refresh();
});

function validateNewUser() {
	if (!newUser.value) {
		return false;
	}
	return validateUsername(newUser.value.name) && validatePassword(newUser.value.password);
}

function validateUsername(username: string): boolean {
	return !!username && !users.listing.some(u => u.name == username);
}

function validatePassword(password: string): boolean {
	return !!password;
}

function beginCreateUser() {
	newUser.value = {
		name: "",
		password: "",
		admin: false,
	};
}

function endCreateUser() {
	if (newUser.value) {
		users.create(newUser.value);
	}
	newUser.value = null;
}
</script>

<style scoped>
ul {
	width: calc(70% + 40px);
}

button.submit {
	margin-top: 10px;
}
</style>
