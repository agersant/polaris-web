<template>
	<div class="setupContainer">
		<div class="logo">
			<img src="/assets/logo_no_text.svg" />
		</div>
		<div class="step">
			<Welcome v-if="step == 'welcome'" v-on:proceed="ackWelcome" />
			<Mount v-if="step == 'mount'" />
			<User v-if="step == 'user'" />
			<Finish v-if="step == 'finish'" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useMountDirsStore } from "@/stores/mount-dirs";
import { useUsersStore } from "@/stores/users";
import Finish from "./steps/Finish.vue";
import Mount from "./steps/Mount.vue";
import User from "./steps/User.vue";
import Welcome from "./steps/Welcome.vue";

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

<style scoped>
.setupContainer {
	width: 50%;
	height: 100%;
	display: flex;
	flex-wrap: nowrap;
	justify-content: stretch;
	align-items: flex-start;
	align-content: flex-start;

	margin: auto;
	padding-top: 10%;
	box-sizing: border-box;
}

.step {
	flex-grow: 1;
	flex-shrink: 1;
	border-right: 2px solid var(--theme-accent);
	padding-left: 40px;
	padding-right: 40px;
}

.logo {
	width: 15%;
	padding-top: 10px;
	padding-right: 40px;
	flex-grow: 0;
	flex-shrink: 0;
}

img {
	width: 100%;
}
</style>
