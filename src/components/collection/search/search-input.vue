<template>
	<form name="searchForm" v-on:submit.prevent="find">
		<input type="search" v-model="query" />
		<button class="submit" v-bind:submit="true">Find</button>
	</form>
</template>

<script>
export default {
	data() {
		return {
			query: ""
		};
	},

	methods: {
		find() {
			this.$router.push("/search/" + encodeURIComponent(this.query)).catch(err => {});
		}
	}
};
</script>

<style scoped>
form {
	height: 22px;
	display: flex;
}

input,
button {
	padding-top: 0;
	padding-bottom: 0;
	margin-bottom: 0;
}

input {
	width: 40%;
	font-size: 0.812rem;
}

button {
	margin-left: 10px;
}
</style>