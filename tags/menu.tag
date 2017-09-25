<menu>
	<ul>
		<li each={ buttons } onclick={ onClickTab } class={ noselect: 1, selected: pattern.test(parent.currentURL) }>
			<i class="noselect material-icons md-18">{ icon }</i>
		</li>
	</ul>

	<script>
		this.buttons = [
			{ icon: "library_music", target: "browse", pattern: new RegExp("browse") },
			{ icon: "shuffle", target: "random", pattern: new RegExp("random") },
			{ icon: "new_releases", target: "recent", pattern: new RegExp("recent") },
			{ icon: "playlist_play", target: "playlists", pattern: new RegExp("playlist") },
		];

		if (Cookies.get("admin") == "true") {
			this.buttons.push(
				{ icon: "settings", target: "settings/collection", pattern: new RegExp("settings") }
			);
		}

		route(function(currentURL, a) {
			this.currentURL = currentURL || this.buttons[0].target;
		}.bind(this));

		onClickTab(e) {
			var newRoute = new RegExp("#" + e.item.url + "$");
			var currentURL = window.location.href;
			if (newRoute.test(currentURL)) {
				route.exec();
			} else {
				route(e.item.target);
			}
		}
	</script>

	<style>
		ul {
			text-align: center;
			height: 100%;
			background-color: #161A1E;
		}

		li {
			height: 50px;
			box-sizing: border-box;
		}

		li i.material-icons {
			color: #FFF;
			line-height: 50px;
		}

		.selected {
			background-color: #44C8F1;
		}
	</style>
</menu>