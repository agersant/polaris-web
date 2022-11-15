/// <reference types="cypress" />

import "../support/commands";

describe("Users", function () {
	beforeEach(function () {
		cy.wipeInitialSetup();
		cy.completeInitialSetup();
		cy.login();
	});

	it("Can add a user", () => {
		cy.intercept({ method: "POST", url: "/api/user" }).as("postUser");
		cy.intercept({ method: "GET", url: "/api/users" }).as("getUsers");

		const username = Math.random().toString();
		const password = Math.random().toString();

		cy.visit("/");
		cy.navigateToSettings();
		cy.get("[data-cy=users]").click();
		cy.wait("@getUsers");

		cy.get("[data-cy=begin-create-user").click();
		cy.get("[data-cy=new-user-name").type(username).blur();
		cy.get("[data-cy=new-user-password").type(password).blur();
		cy.get("[data-cy=end-create-user").click();
		cy.wait("@postUser");
		cy.wait("@getUsers");

		cy.reload();
		cy.wait("@getUsers");
		cy.get("[data-cy=username]").contains(username);
	});

	it("Can delete a user", () => {
		cy.intercept({ method: "POST", url: "/api/user" }).as("postUser");
		cy.intercept({ method: "GET", url: "/api/users" }).as("getUsers");
		cy.intercept({ method: "DELETE", url: "/api/user/*" }).as("deleteUser");

		const username = Math.random().toString();
		const password = Math.random().toString();

		cy.visit("/");
		cy.navigateToSettings();
		cy.get("[data-cy=users]").click();
		cy.wait("@getUsers");

		cy.get("[data-cy=begin-create-user").click();
		cy.get("[data-cy=new-user-name").type(username).blur();
		cy.get("[data-cy=new-user-password").type(password).blur();
		cy.get("[data-cy=end-create-user").click();
		cy.wait("@postUser");
		cy.wait("@getUsers");
		cy.get("[data-cy=delete-user]:not([disabled])").click();
		cy.wait("@deleteUser");
		cy.wait("@getUsers");

		cy.reload();
		cy.wait("@getUsers");
		cy.get("[data-cy=username]").should("have.length", 1);
	});
});
