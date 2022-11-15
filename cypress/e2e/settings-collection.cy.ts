/// <reference types="cypress" />

import "../support/commands";

describe("Collection Settings", function () {
	beforeEach(function () {
		cy.wipeInitialSetup();
		cy.completeInitialSetup();
		cy.login();
	});

	it("Can save album art pattern", () => {
		cy.intercept({ method: "PUT", url: "/api/settings" }).as("putSettings");

		const pattern = Math.random().toString();

		cy.visit("/");
		cy.navigateToSettings();
		cy.get("[data-cy=collection]").click();
		cy.get("[data-cy=album-art-pattern").clear().type(pattern).blur();
		cy.wait("@putSettings");

		cy.reload();
		cy.get("[data-cy=album-art-pattern").should("have.value", pattern);
	});

	it("Can save sleep duration", () => {
		cy.intercept({ method: "PUT", url: "/api/settings" }).as("putSettings");

		const sleepDuration = Math.round(Math.random() * 1000000).toString();

		cy.visit("/");
		cy.navigateToSettings();
		cy.get("[data-cy=collection]").click();
		cy.get("[data-cy=sleep-duration").clear().type(sleepDuration).blur();
		cy.wait("@putSettings");

		cy.reload();
		cy.get("[data-cy=sleep-duration").should("have.value", sleepDuration);
	});

	it("Can add a music source", () => {
		cy.intercept({ method: "GET", url: "/api/mount_dirs" }).as("getMountDirs");
		cy.intercept({ method: "PUT", url: "/api/mount_dirs" }).as("putMountDirs");

		const source = Math.random().toString();
		const name = Math.random().toString();

		cy.visit("/");
		cy.navigateToSettings();
		cy.get("[data-cy=collection]").click();
		cy.wait("@getMountDirs");
		cy.get("[data-cy=add-mount-dir]").click();

		cy.get("[data-cy=mount-dir-source").last().type(source).blur();
		cy.wait("@putMountDirs");
		cy.wait("@getMountDirs");

		cy.get("[data-cy=mount-dir-name").last().type(name).blur();
		cy.wait("@putMountDirs");
		cy.wait("@getMountDirs");

		cy.reload();
		cy.get("[data-cy=mount-dir-source")
			.filter((k, el) => (el as HTMLInputElement).value == source)
			.should("have.length", 1);
		cy.get("[data-cy=mount-dir-name")
			.filter((k, el) => (el as HTMLInputElement).value == name)
			.should("have.length", 1);
	});

	it("Can remove a music source", () => {
		cy.intercept({ method: "GET", url: "/api/mount_dirs" }).as("getMountDirs");
		cy.intercept({ method: "PUT", url: "/api/mount_dirs" }).as("putMountDirs");

		const source = Math.random().toString();
		const name = Math.random().toString();

		cy.visit("/");
		cy.navigateToSettings();
		cy.get("[data-cy=collection]").click();
		cy.wait("@getMountDirs");
		cy.get("[data-cy=add-mount-dir]").click();

		cy.get("[data-cy=mount-dir-source").last().type(source).blur();
		cy.wait("@putMountDirs");
		cy.wait("@getMountDirs");

		cy.get("[data-cy=mount-dir-name").last().type(name).blur();
		cy.wait("@putMountDirs");
		cy.wait("@getMountDirs");

		cy.get("[data-cy=delete-mount-dir]").last().click();
		cy.wait("@putMountDirs");
		cy.wait("@getMountDirs");

		cy.reload();
		cy.get("[data-cy=mount-dir-name").should("have.length", 1);
	});

	it("Can trigger reindex", () => {
		cy.intercept({ method: "POST", url: "/api/trigger_index" }).as("triggerIndex");

		cy.visit("/");
		cy.navigateToSettings();
		cy.get("[data-cy=collection]").click();
		cy.get("[data-cy=reindex]").click();
		cy.wait("@triggerIndex");
		cy.get("[data-cy=reindex").contains("On it");
	});
});
