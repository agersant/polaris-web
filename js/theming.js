var theming = (function() {

	var bases = new Map();
	var defaultTheme;
	var currentTheme;
	var defaulAccentColor = "#44C8F1";
	var currentAccentColor;

	var registerBase = function(id, content) {
		bases.set(id, content);
		if (!defaultTheme) {
			defaultTheme = id;
			this.setBase(null);
			this.setAccentColor(null);
		}
	}

	var listBases = function() {
		var result = Array.from(bases, ([id, content]) => {
			return { id: id, name: content.name, }
		});
		result.sort(function(a, b) { return a.name > b.name ? 1 : -1; });
		return result;
	}

	var setBase = function(id) {
		var entry = bases.get(id);
		if (!bases.get(id)) {
			id = defaultTheme;
		}
		entry = bases.get(id);
		currentTheme = id;

		const themeNode = document.querySelector("div.theme-base");
		themeNode.style.cssText = null;
		Object.entries(entry.colors).forEach(([key, value]) => {
			themeNode.style.setProperty(key, value);
		});
	}

	var setAccentColor = function(color) {
		if (!color) {
			color = defaulAccentColor;
		}
		currentAccentColor = color;
		const accentNode = document.querySelector("div.theme-accent");
		accentNode.style.setProperty("--theme-accent", color);
	}

	var getCurrentTheme = function() {
		return currentTheme;
	}

	var getCurrentAccentColor = function() {
		return currentAccentColor;
	}

	return {
		registerBase: registerBase,
		listBases: listBases,
		setBase: setBase,
		setAccentColor: setAccentColor,
		getCurrentTheme: getCurrentTheme,
		getCurrentAccentColor: getCurrentAccentColor,
	}

})();
