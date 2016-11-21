var utils = (function() {

	var getFileExtension = function(file) {
		var regex = /\.([0-9a-z]+)$/i;
		var matches = regex.exec(file);
		if (matches) {
			return matches[1];
		}
		return null;
	};

	return {
		getFileExtension: getFileExtension,
	} 

})();
