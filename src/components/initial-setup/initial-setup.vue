<template>
	<div class="setupContainer">
		<div class="logo">
			<img v-bind:src="logoImage" />
		</div>
		<div class="step">
			<welcome v-if="step == 'welcome'" v-on:proceed="ackWelcome"></welcome>
			<mount v-if="step == 'mount'"></mount>
			<user v-if="step == 'user'"></user>
			<finish v-if="step == 'finish'"></finish>
		</div>
	</div>
</template>

<script>
import { mapState } from "vuex";
import logoUrl from "url:/assets/logo_no_text.png";
import Finish from "./steps/finish";
import Mount from "./steps/mount";
import User from "./steps/user";
import Welcome from "./steps/welcome";
export default {
	components: {
		finish: Finish,
		mount: Mount,
		user: User,
		welcome: Welcome,
	},

	data() {
		return {
			didAckWelcome: false,
			logoImage: logoUrl,
		};
	},

	mounted() {
		this.$store.dispatch("mountDirs/refresh");
		this.$store.dispatch("users/refresh");
	},

	computed: {
		...mapState(["mountDirs", "users"]),

		step() {
			if (!this.didAckWelcome || !this.mountDirs || !this.users) {
				return "welcome";
			}
			if (!this.mountDirs.listing.length) {
				return "mount";
			}
			if (!this.users.listing.some(u => u.is_admin)) {
				return "user";
			}
			return "finish";
		},
	},

	watch: {
		step(to, from) {
			if (to == "finish") {
				setTimeout(this.exit.bind(this), 2000);
			}
		},
	},

	methods: {
		ackWelcome() {
			this.didAckWelcome = true;
		},

		exit() {
			this.$router.push("/").catch(err => {});
		},
	},
};
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
