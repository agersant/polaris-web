<template>
	<form name="searchForm" v-on:submit.prevent="runSearch">
		<input type="search" v-model="query" />
		<button class="submit" v-bind:submit="true">Find</button>
	</form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const query = ref("");

function runSearch() {
	router.push("/search/" + encodeURIComponent(query.value)).catch(err => {});
}
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