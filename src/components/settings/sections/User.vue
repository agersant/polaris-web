<template>
	<div>
		<div class="username">
			<i class="noselect material-icons md-24">account_box</i><span data-cy="username">{{ user.name }}</span>
		</div>
		<div class="details">
			<div class="admin">
				<input type="checkbox" id="'admin_' + user.name" v-bind:disabled="isSelf(user)"
					v-bind:checked="user.is_admin" @input="onIsAdminChanged" />
				<label for="'admin_' + user.name" class="admin">Administrator</label>
				<p class="tip">Grants access to all settings.</p>
			</div>
			<div class="actions">
				<button v-if="!editingPassword" @click="beginPasswordEdit">Change password</button>
				<form class="password-editing" v-if="editingPassword" v-on:submit.prevent="endPasswordEdit(user)">
					<input type="password" autocomplete="new-password" v-model="newPassword"
						placeholder="New password" />
					<StateButton v-if="passwordEditingState" v-bind:disabled="!newPassword" v-bind:submit="true"
						v-bind:states="passwordEditingStates" v-bind:state="passwordEditingState" />
				</form>
				<button class="danger delete" v-bind:disabled="isSelf(user)" @click="deleteUser"
					data-cy="delete-user">Delete</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { User } from "@/api/dto";
import StateButton, { State } from "@/components/StateButton.vue";
import { useUserStore } from "@/stores/user";
import { useUsersStore } from "@/stores/users";

const currentUser = useUserStore();
const users = useUsersStore();

const props = defineProps<{
	user: User,
}>();

const newPassword = ref("");
const editingPassword = ref(false);
const passwordEditingStates: Ref<Record<string, State>> = ref({
	ready: { name: "OK" },
	applying: { name: "Saving…", disabled: true },
	success: { name: "Got it!", disabled: true, success: true },
	failure: { name: "Error :(", disabled: true, failure: true },
});
const passwordEditingState: Ref<State> = ref(passwordEditingStates.value.ready);

function isSelf(user: User) {
	return user.name == currentUser.name;
}

function onIsAdminChanged(event: Event) {
	const userUpdate = {
		new_is_admin: (event.target as HTMLInputElement).checked,
	};
	users.update(props.user.name, userUpdate);
}

function beginPasswordEdit() {
	editingPassword.value = true;
	newPassword.value = "";
	passwordEditingState.value = passwordEditingStates.value.ready;
}

async function endPasswordEdit(user: User) {
	passwordEditingState.value = passwordEditingStates.value.applying;
	const userUpdate = {
		new_password: newPassword.value,
	};
	const success = await users.update(user.name, userUpdate);
	if (success) {
		passwordEditingState.value = passwordEditingStates.value.success;
	} else {
		passwordEditingState.value = passwordEditingStates.value.failure;
	}
	setTimeout(() => {
		passwordEditingState.value = passwordEditingStates.value.ready;
		editingPassword.value = false;
	}, 2000);
}

function deleteUser() {
	users.delete(props.user.name);
}
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
