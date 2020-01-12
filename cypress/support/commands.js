Cypress.Commands.add("wipeInitialSetup", () => {
	cy.request({
		method: 'POST',
		url: '/api/auth',
		body: {
			username: "testUser",
			password: "testPassword"
		},
		failOnStatusCode: false
	}).then((auth) => {
		if (auth.status == 200) {
			cy.request('PUT', '/api/settings', {
				users: [],
				mount_dirs: []
			})
		}
		cy.clearCookies()
	});
})
