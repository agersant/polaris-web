import Vue from 'vue'
import Cookies from 'js-cookie'
import API from "./api"
import Router from "./router"
import Store from "./store/store"
import EntryPoint from "./components/entry-point"

API.initialSetup()
	.then(data => {
		if (!data.has_any_users) {
			Router.push('/welcome').catch(err => { });
		} else if (Cookies.get('username') == undefined) {
			Router.push('/auth').catch(err => { });
		} else {
			if (window.location.hash == "#/") {
				Router.push('/browse').catch(err => { });
			}
			Store.commit("playlist/loadFromDisk");
		}
		new Vue({
			store: Store,
			router: Router,
			render: k => k(EntryPoint)
		}).$mount('#vue-container');
	});
