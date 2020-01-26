<template>
	<p>COLLECTION</p>
	<!-- <form if={ config } onsubmit={ save }>
		<div class="field">
			<label for="art_pattern">Album art pattern</label><input type="text" id="art_pattern" value={ config.album_art_pattern } oninput={ onPatternInput } placeholder="Folder.(jpg|png)"/>
			<p class="tip">The regular expression used to detect album art files.</p>
			<p if={ !isPatternValid( config.album_art_pattern ) } class="tip error">Please enter a valid regular expression.</p>
		</div>
		<div class="field sources">
			<label>Music sources</label>
			<table>
				<thead>
					<th>Location</th>
					<th>Name</th>
					<th/>
				</thead>
				<tr each={ mountPoint in mountPoints }>
					<td><input type="text" value={ mountPoint.source } oninput={ onPathInput } /></td>
					<td><input type="text" value={ mountPoint.name } oninput={ onNameInput }/></td>
					<td><i onClick={ deleteMountPoint } class="noselect material-icons md-18">delete</i></td>
				</tr>
			</table>
			<button onClick={ addSource }>Add more</button>
		</div>
		<div class="field sleep_duration">
			<label for="sleep_duration">Scan collection every
				<input type="text" id="sleep_duration" value={ Math.round(config.reindex_every_n_seconds / 60) } oninput={ onSleepInput } placeholder=""/> minutes
			</label>
			<async-button ref="reindex" submit={ false } states={ reindexStates } action={ reindex }/>
		</div>
		<settings-apply disabled={ !isPatternValid(config.album_art_pattern) } />
	</form>-->
</template>

<script>
// var self = this;
// this.config = null;
// this.mountPoints = null;

// this.on('mount', function() {
// 	utils.api("/settings")
// 	.then(function(res) { return res.json(); })
// 	.then(function(data) {
// 		this.config = data;
// 		this.mountPoints = data.mount_dirs;
// 		this.update();
// 	}.bind(self));
// });

// isPatternValid(pattern) {
// 	try {
// 		var re = new RegExp(pattern);
// 		return true;
// 	} catch(e) {
// 		return false;
// 	}
// }

// onPatternInput(e) {
// 	this.config.album_art_pattern = e.target.value;
// }

// onSleepInput(e) {
// 	var newDuration = Math.round(e.target.value) * 60;
// 	if (isNaN(newDuration) || newDuration < 0) {
// 		newDuration = 0;
// 	}
// 	e.target.value = newDuration / 60;
// 	this.config.reindex_every_n_seconds = newDuration * 1;
// }

// onPathInput(e) {
// 	e.item.mountPoint.source = e.target.value;
// }

// onNameInput(e) {
// 	e.item.mountPoint.name = e.target.value;
// }

// addSource(e) {
// 	e.preventDefault();
// 	this.mountPoints.push({});
// }

// deleteMountPoint(e) {
// 	e.stopPropagation();
// 	if (this.mountPoints.length == 1) {
// 		this.mountPoints = [{}];
// 	} else {
// 		var mountPointIndex = this.mountPoints.indexOf(e.item.mountPoint);
// 		if (mountPointIndex >= 0) {
// 			this.mountPoints.splice(mountPointIndex, 1);
// 		}
// 	}
// }

// this.reindexStates = {
// 	ready: { name: "Scan now", init: true },
// 	applying: { name: "Hold on…", disabled: true },
// 	success: { name: "On it!", disabled: true, success: true },
// 	failure: { name: "Error :(", disabled: true, failure: true },
// };

// reindex(e) {
// 	e.preventDefault();
// 	this.refs.reindex.setState(this.reindexStates.applying);
// 	utils.api("/trigger_index", { method: "POST" })
// 	.then(function(res) {
// 		if (res.status != 200) {
// 			this.refs.reindex.setState(this.reindexStates.failure);
// 			console.log("Index trigger error: " + res.status);
// 		} else {
// 			this.refs.reindex.setState(this.reindexStates.success);
// 		}
// 		setTimeout(function() {
// 			if (!this.refs || !this.refs.reindex) {
// 				return;
// 			}
// 			this.refs.reindex.setState(this.reindexStates.ready);
// 		}.bind(this), 2000);
// 	}.bind(this));
// }

// save(e) {
// 	e.preventDefault();
// 	eventBus.trigger("settings:submitConfig", this.config);
// }
</script>

<style scoped>
.sleep_duration label {
	display: inline;
}

.sleep_duration input {
	display: inline;
	text-align: right;
}
</style>
