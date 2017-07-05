<settings-apply>
	<async-button states={ states } disabled={ opts.disabled }/>
	<script>
		this.states = {
			ready: { name: "Apply", init: true },
			applying: { name: "Applying…", disabled: true },
			success: { name: "Saved!", disabled: true, success: true },
			failure: { name: "Error :(", disabled: true, failure: true },
		};

		this.on('mount', function() {
			this.tags["async-button"].setState(this.states.ready);
		});

		eventBus.on("settings:submissionStatusUpdate", function(s) {
			var newState = this.states[s];
			this.tags["async-button"].setState(newState);
		}.bind(this));
		
		this.on("unmount", function(){
			eventBus.off("settings:submissionStatusUpdate");
		});
	</script>
</settings-apply>