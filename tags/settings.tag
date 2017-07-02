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

	<style>
		.paneContent {
			padding-top: 40px;
		}

		.field {
			margin-bottom: 25px;
		}

		label {
			display: block;
			font-weight: 400;
			margin-bottom: 2px;
		}

		input {
			display: block;
			width: 55%;
			padding: 4px;
			padding-left: 8px;
			padding-right: 8px;
			margin-bottom: 5px;
			border: 1px solid #AAA;
			border-radius: 3px;
			font-size: 0.875rem;
			box-sizing: border-box;
		}

		input[type="submit"] {
			width: inherit;
			margin-bottom: 0;
		}

		.tip {
			width: 50%;
			font-size: 0.8125rem;
			color: #999;
		}
	</style>

</settings>
