<main>
	<browser class="focused" name="browser" ondragenter={ onBrowserMouseEnter } onmouseenter={ onBrowserMouseEnter }></browser>
	<playlist name="playlist" ondragenter={ onPlaylistMouseEnter } onmouseenter={ onPlaylistMouseEnter }></playlist>
	<player></player>

	<script>
		onBrowserMouseEnter(e) {
			this.browser.classList.add("focused");
			this.playlist.classList.remove("focused");
		}

		onPlaylistMouseEnter(e) {
			this.browser.classList.remove("focused");
			this.playlist.classList.add("focused");
		}
	</script>

	<style>
		playlist, browser {
			overflow-x: hidden;
			background-color: white;
		}

		browser {
			position: absolute;
			width: 75%;
			left: 0;
			height: calc(100% - 200px);
		}

		playlist {
			position: absolute;
			right: 0;
			height: calc(100% - 200px);
			z-index: 1;
			border-left: 1px solid #EEE;
		}

		player {
			position: absolute;
			bottom: 0;
			width: 100%;
			height: 200px;
		}

		playlist.focused, browser.focused {
			transition: width 0.120s ease;
			width: 75%;
		}

		playlist:not(.focused), browser:not(.focused) {
			transition: width 0.120s ease;
			width: 25%;
		}
	</style>
</main>