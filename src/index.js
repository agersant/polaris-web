import Vue from 'vue'
import Router from "./router"
import Store from "./store/store"
import EntryPoint from "./components/entry-point"

new Vue({
	store: Store,
	router: Router,
	render: k => k(EntryPoint)
}).$mount('#vue-container');
