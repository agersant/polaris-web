<playlists>

	<div class="paneHeader">
		<h2>Playlists</h2>
	</div>

	<div class="paneContent">
		<ul>
			<li class="noselect" each={ playlists }>{ name }</li>
		</ul>
	</div>

	<script>
		
		this.playlists = [];

		load() {
			fetch("api/playlist/list", { credentials: "same-origin" })
			.then(function(res) { return res.json(); })
			.then(function(data) {
				if (this.dead) {
					return;
				}
				this.playlists = data;
				this.update();
			}.bind(this));
		}

		this.on("mount", function(){
			this.load();
		}.bind(this));

		eventBus.on("playlist-save:transmitted", this.load);
		this.on("unmount", function() {
			this.dead = true;
			eventBus.off("playlist-save:transmitted");
		}.bind(this));

	</script>

	<style>
		.paneContent {
			padding-top: 50px;
		}

		i {
			position: relative;
			top: 3px;
			margin-right: 5px;
		}

		ul {
			margin-bottom: 40px;
		}

		li:not(:last-child) {
			border-bottom: 1px solid #DDD;
		}

		li:not(:first-child) {
			padding-top: 8px;
		}

		li {
			cursor: pointer;
			padding-bottom: 6px;
		}
	</style>

</playlists>