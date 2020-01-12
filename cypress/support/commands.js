Cypress.Commands.add('wipeInitialSetup', () => {

	let wipe = () => {
		cy.request('PUT', '/api/settings', {
			users: [],
			mount_dirs: []
		})
		cy.clearCookies()
	}

	cy.request('GET', '/api/initial_setup')
		.then((r) => {
			if (!r.body.has_any_users) {
				wipe()
			} else {
				cy.request('POST', '/api/auth', {
					username: 'testUser',
					password: 'testPassword'
				}).then(wipe)
			}
		})
})

Cypress.Commands.add('completeInitialSetup', () => {
	cy.request('GET', '/api/initial_setup')
		.then((r) => {
			if (r.body.has_any_users) {
				return
			}
			cy.request('PUT', '/api/settings', {
				users: [{
					username: 'testUser',
					password: 'testPassword'
				}],
				mount_dirs: [{
					source: 'tests/collection',
					name: 'Test'
				}]
			})
		})
	cy.clearCookies()
})
