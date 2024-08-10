<template>
	<div class="flex justify-center items-center bg-surface-100 dark:bg-surface-900">
		<div class="relative w-[550px]">
			<div
				class="p-20 rounded-lg border bg-surface-0 dark:bg-surface-800 border-surface-200 dark:border-surface-700">
				<img src="/assets/logo.svg" class="mb-20" />
				<form name="authForm" @submit.prevent="doLogin">
					<Fluid>
						<label for="username" class="block mb-2">Username</label>
						<InputText v-model="username" :invalid="badCredentials" placeholder="Username"
							pt:root:data-cy="username" pt:root:id="username" pt:root:autofocus="true" class="mb-4" />
						<label for="password" class="block mb-2">Password</label>
						<Password v-model="password" :feedback="false" :invalid="badCredentials" placeholder="Password"
							toggleMask :pt="{ pcInput: { root: { 'data-cy': 'password', id: 'password' } } }"
							class="mb-8" />
						<Button label="Sign In" pt:root:type="submit" />
					</Fluid>
				</form>
			</div>
			<Message v-if="badCredentials" data-cy="login-error" severity="error" class="absolute w-full -bottom-16">
				Incorrect
				credentials,
				please try
				again.</Message>
		</div>
	</div>
</template>

<script setup lang="ts">
import Button from "primevue/button"
import Fluid from 'primevue/fluid';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Password from 'primevue/password';
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
