<template>
	<form v-if="users" v-on:submit.prevent>
		<label>Users</label>
		<ul>
			<li v-for="(user, index) in users.listing" v-bind:key="index">
				<user v-bind:user="user" />
			</li>
		</ul>

		<button v-if="!newUser" v-on:click="beginCreateUser">Create user</button>
		<form v-if="newUser" v-on:submit.prevent="endCreateUser">
			<label>Create User</label>
			<div class="field">
				<label for="name">Username</label>
				<input id="name" type="text" v-model="newUser.name" placeholder="" />
				<label for="password">Password</label>
				<p v-if="!validatePassword(newUser.password)" class="tip error">The password cannot be blank.</p>
				<input id="password" type="password" autocomplete="new-password" v-model="newUser.password" placeholder="" />
				<button class="submit" v-bind:disabled="!validateNewUser()" submit="true" v-on:click="endCreateUser">Create user</button>
			</div>
		</form>
	</form>
</template>

<script>
import { mapState } from "vuex";
import User from "/src/components/settings/sections/user";
export default {
	components: {
		user: User,
	},

	data() {
		return {
			newUser: null,
		};
	},

	computed: {
		...mapState(["users"]),
	},

	mounted() {
		this.$store.dispatch("users/refresh");
	},

	methods: {
		validateNewUser() {
			return this.validateUsername(this.newUser.name) && this.validatePassword(this.newUser.password);
		},

		validateUsername(username) {
			return username && !this.users.listing.some(u => u.name == username);
		},

		validatePassword(password) {
			return password;
		},

		beginCreateUser() {
			this.editing = null;
			this.newUser = {
				name: "",
				password: "",
				isAdmin: false,
			};
		},

		endCreateUser() {
			this.$store.dispatch("users/create", this.newUser);
			this.newUser = null;
		},

		deleteUser(user) {
			this.$store.dispatch("users/delete", user.name);
		},
	},
};
</script>

<style scoped>
ul {
	width: calc(70% + 40px);
}

button.submit {
	margin-top: 10px;
}
</style>
