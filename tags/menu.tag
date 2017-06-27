<menu>
	<ul>
		<li each={ buttons } onclick={ onClickTab } class={ noselect: 1, selected: parent.currentURL == url }>
			{ name }
			<i class="noselect material-icons md-18">{ icon }</i>
		</li>
	</ul>

	<script>
		this.buttons = [
			{ icon: "library_music", url: "browse" },
			{ icon: "shuffle", url: "random" },
			{ icon: "new_releases", url: "recent" },
			/*
			{ icon: "playlist_play", url: "" },
			{ icon: "search", url: "" },
			{ icon: "settings", url: "" },
			*/
		];

		route(function(currentURL, a) {
			this.currentURL = currentURL || this.buttons[0].url;
		}.bind(this));

		onClickTab(e) {
			var newRoute = new RegExp("^.*#" + e.item.url + "$");
			var currentURL = window.location.href;
			if (newRoute.test(currentURL)) {
				route.exec();
			} else {
				route(e.item.url);
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