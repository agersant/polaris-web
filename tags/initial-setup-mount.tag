<initial-setup-mount>
	<h2>Music Sources</h2>
	<p class="explanation">Please indicate which directories Polaris should scan to populate your collection.<br/>You can change this or add more directories later from the settings screen.</p>
	<form onsubmit={ proceed }>
		<div class="field">
			<table>
				<thead>
					<th>Location</th>
					<th class="name">Name</th>
					<th/>
				</thead>
				<tr>
					<td><input id="source" type="text" value={ opts.source } oninput={ onPathInput } placeholder="C:\MyMusic"/></td>
					<td class="name"><input id="name" type="text" value={ opts.name } oninput={ onNameInput } placeholder={ "Local Drive Music" }/></td>
				</tr>
			</table>
		</div>
		<button data-cy="submit-mount-points" class="submit" disabled={ !validate() } onclick={ proceed }>Next</button>
	</form>

	<script>
		validate() {
			return opts.name && opts.source;
		}

		onPathInput(e) {
			opts.source = e.target.value;
		}

		onNameInput(e) {
			opts.name = e.target.value;
		}

		proceed(e) {
			e.preventDefault();
			eventBus.trigger("initialSetupMount", {
				name: opts.name,
				source: opts.source,
			});
		}
	</script>
</initial-setup-mount>