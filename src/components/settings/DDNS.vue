<template>
	<div class="flex flex-col">
		<InputText v-model="url" :error="!!error" id="ddns" icon="network_ping" label="Update URL"
			placeholder="https://my-provider.com/update?token=xxx" />
		<div class="mt-4 text-ls-600 text-sm flex flex-col gap-2">
			<p>
				If this setting is populated, the Polaris server will regularly make GET requests at the specified URL.
			</p>
			<p>
				If you use a Dynamic DNS service provider (DuckDNS, freemyip, YDNS, etc.), use the update URL they
				give you in order to expose your Polaris instance to the internet.
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { refDebounced, watchPausable } from "@vueuse/core";

import { getSettings, putSettings, } from "@/api/endpoints";
import InputText from "@/components/basic/InputText.vue";

const url = ref("");

const urlDebounced = refDebounced(url, 200);

const urlWatch = watchPausable(urlDebounced, (to, from) => {
	if (!error.value && from != undefined) {
		putSettings({ ddns_update_url: to });
	}
});

const error = computed(() => {
	if (url.value.length && !URL.canParse(url.value)) {
		return "Not a valid URL";
	} else {
		return null;
	}
});

onMounted(async () => {
	urlWatch.pause();
	url.value = (await getSettings()).ddns_update_url;
	urlWatch.resume();
});

</script>
