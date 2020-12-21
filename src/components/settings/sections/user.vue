<template>
	<div>
		<div class="username">
			<i class="noselect material-icons md-24">account_box</i><span>{{ user.name }}</span>
		</div>
		<div class="details">
			<div class="admin">
				<input type="checkbox" id="'admin_' + user.name" v-bind:disabled="isSelf(user)" v-bind:value="user.is_admin" v-on:input="onIsAdminChanged(user)" />
				<label for="'admin_' + user.name" class="admin">Administrator</label>
				<p class="tip">Grants access to all settings.</p>
			</div>
			<div class="actions">
				<button v-if="!editingPassword" v-on:click="beginPasswordEdit(user)">Change password</button>
				<form class="password-editing" v-if="editingPassword" v-on:submit.prevent="endPasswordEdit(user)">
					<input type="password" autocomplete="new-password" v-model="newPassword" placeholder="New password" />
					<state-button v-bind:disabled="!newPassword" v-bind:submit="true" v-bind:states="passwordEditingStates" v-bind:state="passwordEditingState" />
				</form>
				<button class="danger delete" v-bind:disabled="isSelf(user)" v-on:click="deleteUser(user)">Delete</button>
			</div>
		</div>
	</div>
</template>

<script>
import StateButton from "/src/components/state-button";
export default {
	components: {
		"state-button": StateButton,
	},

	props: {
		user: {
			type: Object,
			required: true,
		},
	},

	data() {
		return {
			newPassword: "",
			editingPassword: false,
			passwordEditingStates: {
				ready: { name: "OK" },
				applying: { name: "Saving…", disabled: true },
				success: { name: "Got it!", disabled: true, success: true },
				failure: { name: "Error :(", disabled: true, failure: true },
			},
			passwordEditingState: null,
		};
	},

	methods: {
		isSelf(user) {
			return user.name == this.$store.getters["user/name"];
		},

		onIsAdminChanged(user) {
			this.$store.dispatch("users/update", { username: user.name, newIsAdmin: user.is_admin });
		},

		beginPasswordEdit(user) {
			this.editingPassword = true;
			this.newPassword = "";
			this.passwordEditingState = this.passwordEditingStates.ready;
		},

		endPasswordEdit(user) {
			this.passwordEditingState = this.passwordEditingStates.applying;
			this.$store.dispatch("users/update", { username: user.name, newPassword: this.newPassword }).then(res => {
				if (res.status != 200) {
					this.passwordEditingState = this.passwordEditingStates.failure;
				} else {
					this.passwordEditingState = this.passwordEditingStates.success;
				}
				setTimeout(() => {
					this.passwordEditingState = this.passwordEditingStates.ready;
					this.editingPassword = false;
				}, 2000);
			});
		},

		deleteUser(user) {
			this.$store.dispatch("users/delete", user.name);
		},
	},
};
</script>

<style scoped>
div.username {
	padding-top: 8px;
	padding-left: 10px;
	background-color: var(--theme-accent);
	border-radius: 5px 5px 0px 0px;
}

div.username i {
	color: var(--theme-foreground-against-accent);
}

div.username span {
	vertical-align: top;
	margin-left: 8px;
	position: relative;
	top: 1px;
	color: var(--theme-foreground-against-accent);
	font-weight: 600;
}

div.details {
	padding: 20px;
	padding-top: 10px;
	padding-bottom: 10px;
	margin-bottom: 20px;
	border-radius: 0px 0px 5px 5px;
	border: 1px solid var(--theme-border-muted);
	border-top: 0;
}

div.actions {
	display: flex;
	justify-content: space-between;
	margin-top: 10px;
}

.admin label {
	font-weight: 300;
}

input[type="checkbox"] {
	margin-right: 5px;
	width: auto;
	position: relative;
	top: 1px;
}

label.admin {
	display: inline;
}

form.password-editing {
	display: flex;
}

form.password-editing input {
	margin-right: 10px;
}
</style>
