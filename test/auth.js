module.exports = {
	"Page loads": function(browser) {
		browser.url("http://localhost:5050");
		browser.expect.element("input[name=\"username\"]").to.be.present.before(2000);
	},

	"Bad password": function(browser) {
		browser.setValue("input[name=\"username\"]", "agersant");
		browser.setValue("input[name=\"password\"]", "bad_password");
		browser.click("input[type=\"submit\"]");
		browser.expect.element("p.tip.error").text.to.contain("Incorrect credentials").before(2000);
	},

	"Good password": function(browser) {
		browser.clearValue("input[name=\"password\"]");
		browser.setValue("input[name=\"password\"]", "very_secret");
		browser.click("input[type=\"submit\"]");
		browser.expect.element("p.tip.error").to.not.be.present.before(2000);
		browser.expect.element("main menu").to.be.present.before(2000);
		browser.end();
	},
};
