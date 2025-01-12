<template>
	<div class="grow overflow-y-auto -mx-4 px-4">
		<div class="flex flex-col rounded-md p-8 border bg-ls-0 border-ls-200 dark:bg-ds-900 dark:border-ds-700">
			<SectionTitle label="Configuration" />
			<InputText v-model="url" :error="!!error" id="ddns" icon="network_ping" label="Update URL"
				placeholder="https://my-provider.com/update?token=xxx" />
			<div class="mt-4 text-ls-600 text-sm flex flex-col gap-2">
				<p>
					If this setting is populated, the Polaris server will regularly make GET requests at the specified
					URL.
				</p>
				<p>
					If you use a Dynamic DNS service provider (DuckDNS, freemyip, YDNS, etc.), use the update URL they
					give you in order to expose your Polaris instance to the internet.
				</p>
			</div>
			<Button label="Apply Changes" icon="check" size="xl" data-pw="apply" class="mt-8 self-end" @click="apply" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { getSettings, putSettings, } from "@/api/endpoints";
import Button from "@/components/basic/Button.vue";
import InputText from "@/components/basic/InputText.vue";
import SectionTitle from "@/components/basic/SectionTitle.vue";

const url = ref("");

const error = computed(() => {
	if (url.value.length && !URL.canParse(url.value)) {
		return "Not a valid URL";
	} else {
		return null;
	}
});

onMounted(async () => {
	url.value = (await getSettings()).ddns_update_url;
});

function apply() {
	if (!error.value && url.value !== undefined) {
		putSettings({ ddns_update_url: url.value });
	}
}

</script>
