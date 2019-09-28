<window-title-updater>
	<script>
		updateTitle(track) {
			document.title = this.formatTrackInfo(track);
		}

		formatTrackInfo(track) {
			result = track.info.artist ? track.info.artist : "Unknown Artist";
			result += " - ";
			result += track.info.title || utils.stripFileExtension(utils.getPathTail(track.info.path));
			return result;
		}

		eventBus.on('player:playing', this.updateTitle);
	</script>
</window-title-updater>
