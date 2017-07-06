module.exports = {
	"Auth": function(browser) {
		browser.url("http://localhost:5050");
		browser.expect.element("input[name=\"username\"]").to.be.present.before(2000);
		browser.setValue("input[name=\"username\"]", "agersant");
		browser.setValue("input[name=\"password\"]", "very_secret");
		browser.click("input[type=\"submit\"]");
		browser.expect.element("main menu").to.be.present.before(2000);
	},

	"Top-level is here": function(browser) {
		browser.expect.element(".directory").to.be.present.before(2000);
		browser.expect.element(".directory").text.to.equal("test_music");
	},

	"Explorer content": function(browser) {
		browser.click(".directory");
		browser.expect.element(".explorerView").to.be.present.before(2000);
		browser.expect.element("li:nth-of-type(1) .directory").text.to.contain("Khemmis");
		browser.expect.element("li:nth-of-type(2) .directory").text.to.contain("Tobokegao");
	},

	"Discography content": function(browser) {
		browser.click(".directory");
		browser.expect.element(".discographyView").to.be.present.before(2000);
		browser.expect.element(".album .cover").to.be.present;
		browser.expect.element(".details .title").text.to.equal("Hunted");
		browser.expect.element(".details .year").text.to.equal("2016");
	},

	"Album content": function(browser) {
		browser.click(".discographyView li");
		browser.expect.element(".albumView").to.be.present.before(2000);
		browser.expect.element(".artist").text.to.equal("Khemmis");
		browser.expect.element(".title").text.to.equal("Hunted");
		browser.expect.element(".trackList").to.be.present;
		browser.expect.element(".trackList li:nth-of-type(5)").to.be.present;
	},

	"Breadcrumbs": function(browser) {
		browser.expect.element("breadcrumbs li:nth-of-type(4)").to.be.present;
		browser.click("breadcrumbs li");
		browser.expect.element(".explorerView").to.be.present.before(2000);
	},

	"Random": function(browser) {
		browser.url("http://localhost:5050#random");
		browser.expect.element("browser h2").text.to.contain("Random").before(2000);
		browser.expect.element(".discographyView").to.be.present;
		browser.expect.element(".discographyView li:nth-of-type(2)").to.be.present;
	},

	"Recent": function(browser) {
		browser.url("http://localhost:5050#recent");
		browser.expect.element("browser h2").text.to.contain("Recent").before(2000);
		browser.expect.element(".discographyView").to.be.present;
		browser.expect.element(".discographyView li:nth-of-type(2)").to.be.present;
		browser.end();
	},
};
