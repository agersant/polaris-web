<main>
	<menu/>
	<router>
		<route path="settings.."><settings/></route>
		<route path=".."><browser/></route>
	</router>
	<playlist/>
	<player/>

	<script>
		this.on('mount', function() {
			route.exec();
		});
	</script>

	<style>
		playlist, browser, settings {
			overflow-x: hidden;
			background-color: #FFF;
		}

		menu {
			position: absolute;
			width: 50px;
			height: 100%;
		}

		browser, settings {
			position: absolute;
			width: calc(40% - 50px);
			left: 50px;
			height: 100%;
		}

		playlist {
			position: absolute;
			width: 60%;
			right: 0;
			height: calc(100% - 160px);
			z-index: 1;
			box-sizing: border-box;
			border-left: 1px solid #DDD;
		}

		player {
			position: absolute;
			width: 60%;
			bottom: 0;
			right: 0;
			height: 160px;
			box-sizing: border-box;
			border-left: 1px solid #DDD;
			border-top: 1px solid #DDD;
		}
	</style>
</main>