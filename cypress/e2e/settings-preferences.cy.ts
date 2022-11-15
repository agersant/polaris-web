/// <reference types="cypress" />

import "../support/commands";

describe("Preferences", function () {
	beforeEach(function () {
		cy.wipeInitialSetup();
		cy.completeInitialSetup();
		cy.login();
	});

	it("Can change theme", () => {
		cy.intercept({ method: "PUT", url: "/api/preferences" }).as("putPreferences");

		cy.visit("/");
		cy.navigateToSettings();
		cy.get("[data-cy=preferences]").click();
		cy.get("[data-cy=theme]").select("Dark");
		cy.get("body").should("have.css", "background-color", "rgb(34, 34, 34)");
		cy.wait("@putPreferences");

		cy.visit("/");
		cy.get("body").should("have.css", "background-color", "rgb(34, 34, 34)");
	});

	it("Can change accent color", () => {
		cy.intercept({ method: "PUT", url: "/api/preferences" }).as("putPreferences");

		cy.visit("/");
		cy.navigateToSettings();
		cy.get("[data-cy=preferences]").click();
		cy.get("[data-cy=accent-color]").invoke("val", "#ff0000").trigger("input").trigger("change");
		cy.get("[data-cy=sidebar]").get("[data-cy=settings]").should("have.css", "background-color", "rgb(255, 0, 0)");
		cy.wait("@putPreferences");

		cy.visit("/");
		cy.navigateToSettings();
		cy.get("[data-cy=sidebar]").get("[data-cy=settings]").should("have.css", "background-color", "rgb(255, 0, 0)");
	});

	it("Can reset theme and accent color", () => {
		cy.intercept({ method: "PUT", url: "/api/preferences" }).as("putPreferences");

		// Setup non default preferences
		cy.visit("/");
		cy.navigateToSettings();
		cy.get("[data-cy=preferences]").click();
		cy.get("[data-cy=theme]").select("Blue");
		cy.wait("@putPreferences");
		cy.get("[data-cy=accent-color]").invoke("val", "#558844").trigger("input").trigger("change");
		cy.wait("@putPreferences");

		// Reset
		cy.get("[data-cy=reset-theming]").click();
		cy.wait("@putPreferences");
		cy.get("body").should("have.css", "background-color", "rgb(255, 255, 255)");
		cy.get("[data-cy=sidebar]").get("[data-cy=settings]").should("have.css", "background-color", "rgb(68, 200, 241)");

		// Verify theming still correct after reload
		cy.visit("/");
		cy.navigateToSettings();
		cy.get("body").should("have.css", "background-color", "rgb(255, 255, 255)");
		cy.get("[data-cy=sidebar]").get("[data-cy=settings]").should("have.css", "background-color", "rgb(68, 200, 241)");
	});
});
