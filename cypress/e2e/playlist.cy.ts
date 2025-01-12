/// <reference types="cypress" />

import "../support/commands";
import "../support/drag-and-drop";

describe("Playlist", function () {
	beforeEach(function () {
		cy.completeInitialSetup();
		cy.login();
	});

	it("can use queue all button for multiple albums", () => {
		cy.visit("/");
		cy.contains("Music Collection");
		cy.contains("Queue All").click();
		cy.get("[data-cy=playlist]").find("[data-cy=track]").should("have.length", 13);
	});

	it("can remove a track", () => {
		cy.visit("/");
		cy.contains("Music Collection");
		cy.contains("Queue All").click();
		cy.get("[data-cy=playlist]").find("[data-cy=track]").first().find("[data-cy=remove]").click();
		cy.get("[data-cy=playlist]").find("[data-cy=track]").should("have.length", 12);
	});

	it("can clear the playlist", () => {
		cy.visit("/");
		cy.contains("Music Collection");
		cy.contains("Queue All").click();
		cy.get("[data-cy=playlist]").find("[data-cy=track]").should("have.length", 13);
		cy.get("[data-cy=clear-playlist]").click();
		cy.get("[data-cy=playlist]").find("[data-cy=track]").should("have.length", 0);
	});

	it("can jump to a track", () => {
		cy.visit("/");
		cy.contains("Music Collection");
		cy.contains("Queue All").click();
		cy.get("[data-cy=playlist]").find("[data-cy=track]").last().click();
		cy.get("[data-cy=playlist]").find("[data-cy=now-playing]").parents("[data-cy=track]").contains("なぜ (Why?)");
	});

	it("shows total duration", () => {
		cy.visit("/");
		cy.contains("Music Collection");
		cy.get("[data-cy=browser]").contains("Test").click();
		cy.get("[data-cy=browser]").contains("Tobokegao").click();
		cy.get("[data-cy=browser]").contains("Picnic").click();
		cy.get("[data-cy=browser-header]").should("have.text", "Picnic");
		cy.contains("Queue All").click();
		cy.get("[data-cy=playlist-duration]").should("have.text", "21s");
	});
});
