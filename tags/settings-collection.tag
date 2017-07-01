<settings-collection>
	<form>
		<div class="field">
			<label for="art_pattern">Album art pattern</label><input type="text" name="art_pattern" placeholder="Folder.(jpg|png)"/>
			<p class="tip">The regular expression used to detect album art files.</p>
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
					<td><input type="text" name="path" value={ mountPoint.path }/></td>
					<td class="name"><input type="text" name="name" value={ mountPoint.name }/></td>
					<td><i onClick={ deleteMountPoint } class="noselect material-icons md-18">delete</i></td>
				</tr>
			</table>
			<button onClick={ addSource }>Add more</button>
		</div>
		<div class="field sleep_duration">
			<label for="sleep_duration">Delay between collection re-scans</label><input type="text" name="sleep_duration" placeholder=""/> minutes
		</div>
		<input type="submit" value="Apply"/>
	</form>

	<script>
		this.mountPoints = [
			{ name:"root", path:"C:\\some_path" },
			{ name:"moarmusic", path:"F:\\more_stuff" },
		];

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

		.sources input {
			width: 100%;
			box-sizing: border-box;
		}
	</style>

</settings-collection>
