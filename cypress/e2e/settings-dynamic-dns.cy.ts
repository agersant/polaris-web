/// <reference types="cypress" />

import "../support/commands";

describe("Dynamic DNS", function () {
	beforeEach(function () {
		cy.completeInitialSetup();
		cy.login();
	});

	it("remembers inputs", () => {
		const username = Math.random().toString();
		const hostname = Math.random().toString();

		cy.intercept({ method: "PUT", url: "/api/ddns" }).as("putDDNS");

		cy.visit("/");
		cy.get("[data-cy=sidebar]").get("[data-cy=settings]").click();
		cy.get("[data-cy=ddns]").click();
		cy.get("[data-cy=ydns-hostname]").clear().type(hostname).blur();
		cy.get("[data-cy=ydns-username]").clear().type(username).blur();
		cy.wait("@putDDNS");

		cy.visit("/");
		cy.get("[data-cy=sidebar]").get("[data-cy=settings]").click();
		cy.get("[data-cy=ddns]").click();
		cy.get("[data-cy=ydns-hostname]").should("have.value", hostname);
		cy.get("[data-cy=ydns-username]").should("have.value", username);
	});
});
