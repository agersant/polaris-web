<template>
	<div class="flex flex-col items-center justify-center bg-ls-50 dark:bg-ds-800">
		<div class="w-[800px] bg-ls-0 dark:bg-ds-900 p-12 pl-0 flex justify-between items-center rounded-lg shadow">
			<div class="basis-64 shrink-0 flex items-center justify-center">
				<img class="w-28 h-28" src="/assets/logo_no_text.svg" />
			</div>
			<div class="grow">
				<Welcome v-if="step == 'welcome'" v-on:proceed="ackWelcome" />
				<Mount v-if="step == 'mount'" />
				<User v-if="step == 'user'" />
				<Finish v-if="step == 'finish'" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useMountDirsStore } from "@/stores/mount-dirs";
import { useUsersStore } from "@/stores/users";
import Finish from "./Finish.vue";
import Mount from "./Mount.vue";
import User from "./User.vue";
import Welcome from "./Welcome.vue";

type Step = "welcome" | "mount" | "user" | "finish";

const router = useRouter();
const mountDirs = useMountDirsStore();
const users = useUsersStore();

const didAckWelcome = ref(false);

onMounted(() => {
	mountDirs.refresh();
	users.refresh();
});

const step = computed((): Step => {
	if (!didAckWelcome.value || !mountDirs.fetchedInitialState || !users.fetchedInitialState) {
		return "welcome";
	}
	if (!mountDirs.listing.length) {
		return "mount";
	}
	if (!users.listing.some(u => u.is_admin)) {
		return "user";
	}
	return "finish";
});

watch(step, (newStep) => {
	if (newStep == "finish") {
		setTimeout(exit, 2000);
	}
});

function ackWelcome() {
	didAckWelcome.value = true;
}

function exit() {
	router.push("/").catch(err => { });
}
</script>
