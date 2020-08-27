<template>
	<div class="authForm">
		<div class="content">
			<img class="logo" src="/assets/logo.png" />
			<form name="authForm" v-on:submit="doLogin">
				<input data-cy="username" type="text" name="username" placeholder="Username" autofocus />
				<input data-cy="password" type="password" name="password" placeholder="Password" />
				<p
					v-if="badCredentials"
					data-cy="login-error"
					class="tip error"
				>Incorrect credentials, please try again.</p>
				<input type="submit" value="Login" />
			</form>
		</div>
	</div>
</template>

<script>
import API from "/src/api";
export default {
	data() {
		return {
			badCredentials: false,
		};
	},

	methods: {
		doLogin: function (e) {
			e.preventDefault();
			const form = document.forms["authForm"];
			const username = form.elements["username"].value;
			const password = form.elements["password"].value;
			this.badCredentials = false;
			API.login(username, password).then(res => {
				if (res.status == 401) {
					this.badCredentials = true;
				}
			});
		},
	},
};
</script>

<style scoped>
.authForm {
	height: 100%;
	margin: auto;
	width: 25%;
}

.logo {
	width: 100%;
	margin-bottom: 70px;
}

.content {
	display: flex;
	flex-flow: column nowrap;
	justify-content: center;
	align-items: stretch;
	height: 90%;
}

form {
	display: flex;
	flex-flow: column nowrap;
	justify-content: center;
	align-items: stretch;
}

input {
	width: inherit;
	display: block;
	margin: 5px 0;
	font-size: 1.5rem;
}

input[type="submit"] {
	align-self: flex-end;
	font-size: 1.25rem;
	margin-top: 15px;
}

input[type="text"],
input[type="password"],
.tip {
	padding-left: 10px;
}

input[type="text"],
input[type="password"] {
	border: 0;
	box-sizing: content-box;
	border-bottom: 1px solid var(--theme-border);
}

.tip {
	/*Exclude from layout so the form doesn't move when this appears*/
	height: 0;
	overflow: visible;
}
</style>
