<settings-collection>
	<form if={ config } onsubmit={ save }>
		<div class="field">
			<label for="art_pattern">Album art pattern</label><input type="text" id="art_pattern" value={ config.album_art_pattern } oninput={ onPatternInput } placeholder="Folder.(jpg|png)"/>
			<p class="tip">The regular expression used to detect album art files.</p>
			<p class="tip error">{ patternError }</p>
		</div>
		<div class="field sources">
			<label>Music sources</label>
			<table>
				<thead>
					<th>Location</th>
					<th class="name">Name</th>
					<th/>
				</thead>
				<tr each={ mountPoint in mountPoints }>
					<td><input type="text" value={ mountPoint.source } oninput={ onPathInput } /></td>
					<td class="name"><input type="text" value={ mountPoint.name } oninput={ onNameInput }/></td>
					<td><i onClick={ deleteMountPoint } class="noselect material-icons md-18">delete</i></td>
				</tr>
			</table>
			<button onClick={ addSource }>Add more</button>
		</div>
		<div class="field sleep_duration">
			<label for="sleep_duration">Delay between collection re-scans</label>
			<input type="text" id="sleep_duration" value={ Math.round(config.reindex_every_n_seconds / 60) } oninput={ onSleepInput } placeholder=""/> minutes
		</div>
		<input type="submit" disabled={ patternError != null } value="Apply"/>
	</form>

	<script>

		var self = this;
		this.config = null;
		this.mountPoints = null;

		this.on('mount', function() {
			fetch("api/settings/", { credentials: "same-origin" })
			.then(function(res) { return res.json(); })
			.then(function(data) {
				this.config = data;
				this.mountPoints = data.mount_dirs;
				this.update();
			}.bind(self));
		});

		onPatternInput(e) {
			this.config.album_art_pattern = e.target.value;
			this.patternError = null;
			try {
				var re = new RegExp(e.target.value);
			} catch(e) {
				this.patternError = "Please enter a valid regular expression.";
			}
		}

		onSleepInput(e) {
			var newDuration = Math.round(e.target.value) * 60;
			if (isNaN(newDuration) || newDuration < 0) {
				newDuration = 0;
			}
			e.target.value = newDuration / 60;
			this.config.reindex_every_n_seconds = newDuration * 1;
		}

		onPathInput(e) {
			e.item.mountPoint.source = e.target.value;
		}

		onNameInput(e) {
			e.item.mountPoint.name = e.target.value;
		}

		addSource(e) {
			e.preventDefault();
			this.mountPoints.push({});
		}

		deleteMountPoint(e) {
			e.stopPropagation();
			if (this.mountPoints.length == 1) {
				this.mountPoints = [{}];
			} else {
				var mountPointIndex = this.mountPoints.indexOf(e.item.mountPoint);
				if (mountPointIndex >= 0) {
					this.mountPoints.splice(mountPointIndex, 1);
				}
			}
		}

		save(e) {
			var data = new FormData();
			data.append( "config", JSON.stringify( this.config ) );
			fetch("api/settings/",
				{	method: "PUT"
				,	credentials: "same-origin"
				,	body: data
				}
			);
		}
	</script>

	<style>
		.sleep_duration input {
			display: inline;
			width: 50px;
			text-align: right;
		}

		table {
			width: 55%;
		}

		th, td {
			border-right: 10px solid white;
		}

		td.name {
			width: 40%;
		}

		th:last-child, td:last-child {
			border: 0;
		}

		th {
			font-family: "Montserrat", "sans-serif";
			text-align: left;
			color: #AAA;
			font-size: 0.8125rem;
		}

		td i {
			cursor: pointer;
			position: relative;
			top: 2px;
		}

		table input {
			width: 100%;
			box-sizing: border-box;
		}
	</style>

</settings-collection>
