<template>
	<div>
		<p class="explanation">
			Polaris can automatically broadcast your computer's IP to YDNS to make your server reachable at a fixed URL.
			You will need to sign up for a
			<a href="https://ydns.io/" target="_blank">YDNS</a> account before filling out the corresponding settings on
			this page. If you prefer not to use YDNS, you can ignore these settings and set
			up any another dynamic DNS service manually.
		</p>

		<form v-if="ddns" v-on:submit.prevent>
			<div class="field">
				<label for="host">Hostname</label>
				<input type="text" id="host" v-model="ddns.host" v-on:change="commit" placeholder="yourname.ydns.eu"
					data-cy="ydns-hostname" />
				<p class="tip">The URL pointing to your Polaris server.</p>
				<label for="username">Username</label>
				<input type="text" id="username" v-model="ddns.username" v-on:change="commit" data-cy="ydns-username" />
				<p class="tip">
					You can find this on the YDNS website under
					<span class="code">Preferences > API</span>.
				</p>
				<label for="password">Password</label>
				<input type="password" id="password" v-model="ddns.password" v-on:change="commit"
					data-cy="ydns-password" />
				<p class="tip">
					You can find this on the YDNS website under
					<span class="code">Preferences > API</span>.
				</p>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import { getDDNSConfig, putDDNSConfig } from "@/api/endpoints";
import { DDNSConfig } from "@/api/dto";

const ddns: Ref<DDNSConfig | null> = ref(null);

onMounted(async () => {
	ddns.value = await getDDNSConfig();
});

function commit() {
	if (!ddns.value) {
		return;
	}
	putDDNSConfig(ddns.value);
}
</script>

<style scoped>
a {
	text-decoration: underline;
	color: var(--theme-accent);
}

.code {
	font-family: "Courier New", "sans-serif";
	color: inherit;
}
</style>
