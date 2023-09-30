const { defineConfig } = require("cypress");

module.exports = defineConfig({
	defaultCommandTimeout: 15000,
	e2e: {
		baseUrl: "http://localhost:5050",
		supportFile: false,
	},
	video: true,
});
