<main>
	<browser name="browser" ondragenter={ onBrowserMouseEnter } onmouseenter={ onBrowserMouseEnter }/>
	<playlist name="playlist" ondragenter={ onPlaylistMouseEnter } onmouseenter={ onPlaylistMouseEnter }/>
	<player/>

	<style>
		playlist, browser {
			overflow-x: hidden;
			background-color: white;
		}

		browser {
			position: absolute;
			width: 40%;
			left: 0;
			height: calc(100% - 160px);
		}

		playlist {
			position: absolute;
			width: 60%;
			right: 0;
			height: calc(100% - 160px);
			z-index: 1;
			border-left: 1px solid #EEE;
		}

		player {
			position: absolute;
			bottom: 0;
			width: 100%;
			height: 160px;
			box-sizing: border-box;
		}
	</style>
</main>