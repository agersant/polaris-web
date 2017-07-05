<async-button>
	<button disabled={ opts.disabled || currentState.disable } class={ submit: 1, success: currentState.success, success: currentState.failure }>
		<div class="status">
			<span each={ state in opts.states } class={ tick-in: currentState == state && canTickIn, tick-out: currentState != state }>
				{ state.name }
			</span>
		</div>
	</button>

	<script>
		this.defaultState = {};
		this.currentState = this.defaultState;
		setState(s) {
			this.canTickIn = this.canTickIn || (this.currentState != this.defaultState && !s.init);
			this.currentState = s;
			this.update();
		}
	</script>

	<style>
		button {
			width: 95px;
			height: 32px;
			padding-left: 0;
			padding-right: 0;
		}

		button.success {
			transition: all 250ms ease-in-out;
			background-color: #65C05A;
		}

		button.failure {
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
</async-button>