import { createApp } from "vue"
import router from "./router"
import store from "./store/store"
import EntryPoint from "./components/entry-point"

Store.dispatch("initialSetup/refresh").then(() => {
	const app = createApp({
		render: k => k(EntryPoint)
	});
	app.use(store);
	app.use(router);
	app.mount('#vue-container');
});
