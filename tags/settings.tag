<settings>
	<div class="paneHeader">
		<h2>Settings</h2>
		<settings-tabs/>
	</div>

	<div class="paneContent">
		<router>
			<route path="settings/users"><settings-users/></route>
			<route path="settings/ddns"><settings-ddns/></route>
			<route path="settings/collection"><settings-collection/></route>
		</router>
	</div>

	<script>
	</script>
	
	<style>
		.paneContent {
			padding-top: 40px;
		}
	</style>

</settings>
