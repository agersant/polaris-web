module.exports = {
	"Welcome page" : function(browser) {
		browser.url("http://localhost:5050");
		browser.expect.element("#initial-setup-page").to.be.present.before(2000);
		browser.expect.element("#initial-setup-page").to.have.attribute("data-is").equals("initial-setup-welcome");
		browser.expect.element("#initial-setup-page h2").text.to.contain("Welcome to Polaris");
		browser.click("button.submit");
	},

	"Mount point setup" : function(browser) {
		browser.expect.element("#initial-setup-page").to.have.attribute("data-is").equals("initial-setup-mount");
		browser.expect.element("#initial-setup-page h2").text.to.contain("Music Sources");
		browser.expect.element("button.submit").to.not.be.enabled;
		browser.setValue("input#source", "test/collection");
		browser.setValue("input#name", "test_music");
		browser.expect.element("button.submit").to.be.enabled;
		browser.click("button.submit");
	},

	"User setup" : function(browser) {
		browser.expect.element("#initial-setup-page").to.have.attribute("data-is").equals("initial-setup-user");
		browser.expect.element("#initial-setup-page h2").text.to.contain("User Account");
		browser.expect.element("button.submit").to.not.be.enabled;
		browser.setValue("input#username", "agersant");
		browser.setValue("input#password", "very_secret");
		browser.setValue("input#password_confirm", "very_secret");
		browser.expect.element("button.submit").to.be.enabled;
		browser.click("button.submit");
	},

	"Flow completion" : function(browser) {
		browser.expect.element("main menu").to.be.present.before(4000);
		browser.end();
	}
};
