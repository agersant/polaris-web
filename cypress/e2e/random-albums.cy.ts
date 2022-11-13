/// <reference types="cypress" />

import "../support/commands";

describe("Random Albums", function () {
	beforeEach(function () {
		cy.completeInitialSetup();
		cy.login();
	});

	it("shows albums", () => {
		cy.visit("/#/random");
		cy.contains("Random");
		cy.get("[data-cy=album]").should("have.length", 3);
	});
});
