/// <reference types="cypress" />

import "../support/commands";

describe("Recent Albums", function () {
	beforeEach(function () {
		cy.completeInitialSetup();
		cy.login();
	});

	it("shows albums", () => {
		cy.visit("/#/recent");
		cy.contains("Recent");
		cy.get("[data-cy=album]").should("have.length", 3);
	});
});
