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

        search-input {
            height: 22px;
        }

        form {
            height: 100%;
            display: flex;
        }

        input, button {
            display: inline;
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
</search-input>