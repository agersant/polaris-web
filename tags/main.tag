<main>
	<browser name="browser" ondragenter={ onBrowserMouseEnter } onmouseenter={ onBrowserMouseEnter }></browser>
	<playlist name="playlist" ondragenter={ onPlaylistMouseEnter } onmouseenter={ onPlaylistMouseEnter }></playlist>
	<player></player>

	<style>
		playlist, browser {
			overflow-x: hidden;
			background-color: white;
		}

		browser {
			position: absolute;
			width: 25%;
			left: 0;
			height: calc(100% - 200px);
		}

		playlist {
			position: absolute;
			width: 75%;
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
			box-sizing: border-box;
		}
	</style>
</main>