<settings-apply>
	<button disabled={ opts.disabled || ( status != "ready" && status != "init" ) } class={ submit:1, success: status == "success", failure: status == "failure" }>
		<div class="status">
			<span class={ tick-in: status == "ready", tick-out: status != "ready" && status != "init" }>Apply</span>
			<span class={ tick-in: status == "applying", tick-out: status != "applying" }>Applying…</span>
			<span class={ tick-in: status == "success", tick-out: status != "success" }>Saved!</span>
			<span class={ tick-in: status == "failure", tick-out: status != "failure" }>Error :(</span>
		</div>
	</button>

	<script>
		this.status = "init";
		setStatus(s) {
			this.status = s;
		}

		eventBus.on("settings:submissionStatusUpdate", this.setStatus.bind(this));
		this.on("unmount", function(){
			eventBus.off("settings:submissionStatusUpdate");
		});
	</script>

	<style>
		button.submit {
			width: 95px;
			height: 32px;
			padding-left: 0;
			padding-right: 0;
		}

		button.submit.success {
			transition: all 250ms ease-in-out;
			background-color: #65C05A;
		}

		button.submit.failure {
			transition: all 250ms ease-in-out;
			background-color: #FF5763;
		}

		.status {
			text-align: center;
			height: 100%;
			width: 100%;
			position: relative;
			overflow: hidden;
		}

		.status span {
			position: absolute;
			left: 0;
			right: 0;
			margin: auto;
		}

		.tick-in {
			animation: tick 250ms ease-in-out;
			animation-fill-mode: forwards;
		}

		.tick-out {
			transition: all 250ms ease-in-out;
			top: -40px;
		}

		@keyframes tick {
			from { top: 40px; }
			to { top: 0px; }
		}
	</style>
</settings-apply>