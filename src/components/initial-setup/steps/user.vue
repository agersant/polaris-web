<template>
	<div>
		<h2>User Account</h2>
		<p
			class="explanation"
		>Please choose a username and a password you would like to use to sign in to Polaris.</p>
		<form v-on:submit.prevent="proceed">
			<div class="field">
				<label for="username">Username</label>
				<input id="username" type="text" v-model="username" />

				<label for="password">Password</label>
				<input type="password" id="password" v-model="password" />

				<label for="password_confirm">Confirm password</label>
				<input type="password" id="password_confirm" v-model="password_confirm" />
				<p
					v-if="password && password_confirm && password !== password_confirm"
					class="tip error"
				>The passwords do not match.</p>
			</div>
			<button
				data-cy="submit-user"
				class="submit"
				v-bind:disabled="!validate()"
				v-on:click.prevent="proceed"
			>Next</button>
		</form>
	</div>
</template>

<script>
export default {
	data() {
		return {
			username: "",
			password: "",
			password_confirm: ""
		};
	},

	methods: {
		validate() {
			return this.username && this.password && this.password === this.password_confirm;
		},

		proceed() {
			let user = { name: this.username, password: this.password, admin: true };
			this.$emit("proceed", user);
		}
	}
};
</script>