<search>
	<div class="paneHeader">
		<h2>Search</h2>
	</div>

	<div class="paneContent">
		<form>
			<input type="text"/><button class="submit">Find</button>
		</form>
	</div>

	<script>
	</script>

	<style>
		.paneContent {
			padding-top: 40px;
		}

		form {
			display: flex;
			flex-flow: row nowrap;
			align-items: stretch;
			justify-content: space-between;
			width: 80%;
			margin: auto;
		}

		input {
			width: calc(100% - 100px);
		}

		input, button {
			display: inline;
			margin: 0;
		}
	</style>

</search>
