<template>
	<div class="setupContainer">
		<div class="logo">
			<img src="/assets/logo_no_text.png" />
		</div>
		<div class="step">
			<welcome v-if="step == 'welcome'" v-on:proceed="next"></welcome>
			<mount v-if="step == 'mount'" v-on:proceed="setMount"></mount>
			<user v-if="step == 'user'" v-on:proceed="setUser"></user>
			<finish v-if="step == 'finish'"></finish>
		</div>
	</div>
</template>

<script>
import * as Utils from "/src/utils";
import Finish from "./steps/finish";
import Mount from "./steps/mount";
import User from "./steps/user";
import Welcome from "./steps/welcome";
export default {
	components: {
		finish: Finish,
		mount: Mount,
		user: User,
		welcome: Welcome
	},

	data() {
		return {
			step: "",
			config: null
		};
	},

	mounted() {
		this.$api
			.request("/settings")
			.then(res => {
				return res.json();
			})
			.then(data => {
				this.config = data;
				this.step = "welcome";
			});
	},

	methods: {
		next() {
			if (!this.config) {
				return;
			}
			if (!this.config.mount_dirs || !this.config.mount_dirs.length) {
				this.step = "mount";
			} else if (!this.config.users || !this.config.users.length) {
				this.step = "user";
			} else {
				this.step = "finish";
				setTimeout(this.login.bind(this), 2000);
			}
		},

		setMount(mountDir) {
			this.config.mount_dirs = [mountDir];
			this.commit().then(res => {
				this.$api.request("/trigger_index", { method: "POST" }).then(this.next);
			});
		},

		setUser(user) {
			this.config.users = [user];
			this.commit().then(this.next);
		},

		commit() {
			return this.$api
				.request("/settings", {
					method: "PUT",
					body: JSON.stringify(this.config),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (!res.ok) {
						console.log("Error while applying settings");
						throw res.status;
					}
					return res;
				});
		},
		login() {
			let username = this.config.users[0].name;
			let password = this.config.users[0].password;
			Utils.tryLogin(username, password).then(res => {
				if (res.status == 200) {
					this.$router.push("/browse");
				} else {
					console.log("Error while signing in");
				}
			});
		}
	}
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
