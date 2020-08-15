<template>
	<form v-if="users" v-on:submit.prevent>
		<label>User accounts</label>
		<ul>
			<li v-for="(user, index) in users" v-bind:key="index">
				<span class="username" v-on:click="toggleEditUser(user)">
					{{ user.name }}
					<i
						class="noselect material-icons md-18"
					>{{ user == editing ? "expand_more" : "chevron_right" }}</i>
				</span>

				<div class="edit" v-if="user == editing">
					<div class="field" v-if="user.isNew">
						<label for="'name_' + user.name">Username</label>
						<input
							id="'name_' + user.name"
							type="text"
							v-model="user.name"
							v-on:change="commit"
							v-on:keypress.enter.prevent
						/>
					</div>

					<div class="field">
						<label for="'paswword_' + user.name">Password</label>
						<input
							type="password"
							id="'password_' + user.name"
							autocomplete="new-password"
							v-model="user.password"
							v-on:change="commit"
							v-on:keypress.enter.prevent
						/>
						<p v-if="!validatePassword(user)" class="tip error">The password cannot be blank.</p>
						<p v-if="!user.isNew" class="tip">Leave blank to preserve current password.</p>
					</div>

					<div class="field">
						<input
							type="checkbox"
							id="'admin_' + user.name"
							v-bind:disabled="isSelf(user)"
							v-model="user.admin"
							v-on:change="commit"
							v-on:keypress.enter.prevent
						/>
						<label for="'admin_' + user.name" class="admin">Administrator</label>
						<p class="tip">Grants access to all settings.</p>
					</div>

					<div v-if="!isSelf(user)" class="delete_container">
						<button class="danger delete" v-on:click="deleteUser(index)">Delete {{ user.name }}</button>
					</div>
				</div>
			</li>
		</ul>
		<button class="add-user" v-on:click="addUser">Add user</button>
	</form>
</template>

<script>
import API from "/src/api";
import Cookies from "js-cookie";
export default {
	data() {
		return {
			users: [],
			editing: null,
		};
	},

	mounted() {
		API.getSettings().then(data => {
			this.users = data.users;
		});
	},

	methods: {
		isSelf(user) {
			return user.name == Cookies.get("username");
		},

		validatePassword(user) {
			return user.password || !user.isNew;
		},

		addUser() {
			var newUser = { name: "New User", password: "", isNew: true, admin: false };
			this.users.push(newUser);
			this.editing = newUser;
		},

		toggleEditUser(user) {
			if (this.editing == user) {
				this.editing = null;
			} else {
				this.editing = user;
			}
		},

		deleteUser(index) {
			if (this.users.length == 1) {
				return;
			} else {
				this.users.splice(index, 1);
			}
			this.commit();
		},

		commit() {
			let settings = {
				users: this.users,
			};
			API.putSettings(settings);
		},
	},
};
</script>

<style scoped>
ul {
	width: calc(70% + 40px);
	padding-left: 20px;
	padding-right: 20px;
	margin-bottom: 10px;
	background-color: var(--theme-background-muted);
	border-radius: 10px;
}

li:not(:last-child) {
	border-bottom: 1px solid var(--theme-border-muted);
}

span.username {
	display: inline-block;
	width: 100%;
	cursor: pointer;
	font-weight: 600;
	padding-top: 10px;
	padding-bottom: 10px;
}

.edit {
	padding-left: 20px;
	padding-right: 20px;
	padding-top: 15px;
	background-color: var(--theme-background-muted);
	border-radius: 5px;
	margin-bottom: 10px;
}

form .edit .field {
	width: 100%;
	padding: 0px;
	margin-bottom: 15px;
}

.edit label {
	font-weight: 400;
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

i {
	float: right;
	text-align: right;
	cursor: pointer;
	position: relative;
	top: 4px;
}

.delete_container {
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-end;
	align-items: stretch;
	padding-bottom: 15px;
}

button.add-user {
	margin-bottom: 25px;
}
</style>
