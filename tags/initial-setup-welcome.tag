<initial-setup-welcome>
	<h2>Welcome to Polaris!</h2>
	<p class="explanation">Your server is up and running, let's configure a couple things.</p>
	<button class="submit" onclick={ proceed }>Sounds good</button>
	<script>
		proceed() {
			eventBus.trigger("initialSetupNext");
		}
	</script>
</initial-setup-welcome>