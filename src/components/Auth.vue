<template>
	<div class="authForm">
		<div class="content">
			<img class="logo" src="/assets/logo.svg" />
			<form name="authForm" @submit.prevent="doLogin">
				<input data-cy="username" type="text" v-model="username" placeholder="Username" autofocus />
				<input data-cy="password" type="password" v-model="password" placeholder="Password" />
				<p v-if="badCredentials" data-cy="login-error" class="tip error">Incorrect credentials, please try
					again.</p>
				<input type="submit" value="Login" />
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/user";

const user = useUserStore();

const username = ref("");
const password = ref("");
const badCredentials = ref(false);

async function doLogin(event: Event) {
	badCredentials.value = false;
	try {
		await user.login(username.value, password.value);
	} catch (e) {
		if (e instanceof Response) {
			if (e.status == 401) {
				badCredentials.value = true;
			}
		}
	}
}
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
