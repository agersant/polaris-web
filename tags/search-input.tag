<search-input>
    <form name="searchForm" onsubmit={ doSearch }>
        <input name="query" type="search"/><button class="submit">Find</button>
    </form>

    <script>
		doSearch(e) {
			e.preventDefault();
			var form = document.forms["searchForm"];
			var query = encodeURIComponent(form.elements["query"].value);
			route("search/" + query);
		}
	</script>

    <style>
        form {
            margin-top: -5px;
        }

        input, button {
            display: inline;
        }

        input {
            width: 40%;
        }

        button {
            margin-left: 10px;
        }
    </style>
</search-input>