/// <reference types="cypress" />

const getAuthToken = () => {
	return cy.request("POST", "/api/auth", {
		username: "testUser",
		password: "testPassword",
	});
};

const triggerIndex = () => {
	getAuthToken().then(response => {
		const authToken = response.body.token;
		cy.request({
			method: "POST",
			url: "/api/trigger_index",
			headers: { Authorization: "Bearer " + authToken },
		});
	});
};

const waitForCollectionIndex = () => {
	getAuthToken().then(response => {
		const authToken = response.body.token;
		cy.request({
			url: "/api/browse",
			headers: { Authorization: "Bearer " + authToken },
		}).then(resp => {
			if (resp.status == 200) {
				if (Array.isArray(resp.body) && resp.body.length > 0) {
					return;
				}
			}
			waitForCollectionIndex();
		});
	});
};

const wipeConfig = authToken => {
	cy.request({
		method: "PUT",
		url: "/api/config",
		headers: { Authorization: "Bearer " + authToken },
		body: {
			users: [],
			mount_dirs: [],
		},
	});
};

const populateConfig = () => {
	return cy.request("PUT", "/api/config", {
		users: [
			{
				name: "testUser",
				password: "testPassword",
				admin: true,
			},
		],
		mount_dirs: [
			{
				source: "test-data/small-collection",
				name: "Test",
			},
		],
	});
};

Cypress.Commands.add("wipeInitialSetup", () => {
	return cy.request("GET", "/api/initial_setup").then(response => {
		if (response.body.has_any_users) {
			getAuthToken().then(response => wipeConfig(response.body.token));
		} else {
			wipeConfig(null);
		}
	});
});

Cypress.Commands.add("completeInitialSetup", () => {
	return cy
		.request("/api/initial_setup")
		.then(response => {
			if (response.body.has_any_users) {
				return;
			}
			return populateConfig();
		})
		.then(() => {
			triggerIndex();
			waitForCollectionIndex();
		});
});

Cypress.Commands.add("login", () => {
	return cy
		.request("POST", "/api/auth", {
			username: "testUser",
			password: "testPassword",
		})
		.then(resp => {
			window.localStorage.setItem("username", resp.body.username);
			window.localStorage.setItem("authToken", resp.body.token);
			window.localStorage.setItem("isAdmin", resp.body.is_admin);
		});
});

Cypress.Commands.add("navigateToRecent", () => {
	return cy.get("[data-cy=sidebar]").get("[data-cy=recent]").click();
});

Cypress.Commands.add("navigateToRandom", () => {
	return cy.get("[data-cy=sidebar]").get("[data-cy=random]").click();
});

Cypress.Commands.add("navigateToSettings", () => {
	return cy.get("[data-cy=sidebar]").get("[data-cy=settings]").click();
});

declare global {
	namespace Cypress {
		interface Chainable<Subject> {
			completeInitialSetup(): void;
			login(): void;
			navigateToRecent(): void;
			navigateToRandom(): void;
			navigateToSettings(): void;
			wipeInitialSetup(): void;
		}
	}
}

export {};
