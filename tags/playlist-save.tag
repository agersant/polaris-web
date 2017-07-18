<playlist-save>
	<div class="close">
		<i class="material-icons md-18" onclick={ cancel }>close</i>
	</div>
	<form>
		<div class="field">
			<label for="playlist_name">Playlist name:
				<input type="text" id="playlist_name" value={ playlistName } oninput={ onNameInput } placeholder="Test"/>
			</label>
		</div>
		<async-button ref="save_playlist_confirm" submit="true" states={ applyStates } onclick={ savePlaylist } />
	</form>

	<script>
		this.applyStates = {
			ready: { name: "Save", init: true },
			saving: { name: "Saving…", disabled: true },
			success: { name: "Saved!", disabled: true, success: true },
			failure: { name: "Error :(", disabled: true, failure: true },
		};

		this.playlistName = "My Playlist🎧";

		onNameInput(e) {
			this.playlistName = e.target.value;
		}

		cancel(e) {
			e.stopPropagation();
			eventBus.trigger("playlist-save:cancel");
		}

		savePlaylist(e) {
			e.stopPropagation();

			var playlist = {};
			playlist.name = this.playlistName; 
			playlist.tracks = this.opts.tracks.map(function(t) {
				return t.info.path;
			});

			var data = new FormData();
			data.append( "playlist", JSON.stringify( playlist ) );
			this.tags["async-button"].setState(this.applyStates.saving);
			
			fetch("api/playlist/",
				{	method: "PUT"
				,	credentials: "same-origin"
				,	body: data
				}
			)
			.then(function(res) {

				if (this.dead) {
					return;
				}

				var status = res.ok ? "success" : "failure";
				this.tags["async-button"].setState(this.applyStates[status]);
				eventBus.trigger("playlist-save:transmitted");
				this.update();

				setTimeout(function() {
					if (this.dead) {
						return;
					}
					if (res.ok) {
						eventBus.trigger("playlist-save:done");
					} else {
						this.tags["async-button"].setState(this.applyStates.ready);
						this.update();
					}
				}.bind(this), 2000);
			}.bind(this));
		}

		this.on("unmount", function() {
			this.dead = true;
		}.bind(this));
	</script>

	<style>

		:scope {
			cursor: default;
			position: absolute;
			width: 400px;
			background-color: #FFF;
			border: 1px solid #DDD;
			border-bottom: 2px solid #44C8F1;
			animation: .15s ease-out 0s 1 intro;
		}

		.close {
			cursor: pointer;
			position: absolute;
			top: 5px;
			right: 5px;
		}

		form {
			padding: 20px;
		}

		@keyframes intro {
			0% {
				transform: translateX(-50px);
				opacity: 0;
			}
			100% {
				transform: translateX(0);
				opacity: 1;
			}
		}

	</style>

</playlist-save> 