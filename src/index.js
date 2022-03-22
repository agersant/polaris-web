import { createApp } from "vue"
import router from "./router"
import store from "./store/store"
import EntryPoint from "./components/entry-point.vue"

store.dispatch("initialSetup/refresh").then(() => {
	const app = createApp(EntryPoint);
	app.use(store);
	app.use(router);
	app.mount('#vue-container');
});
