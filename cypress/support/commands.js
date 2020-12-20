Cypress.Commands.add('getAuthToken', () => {
	cy.request('POST', '/api/auth', {
		username: 'testUser',
		password: 'testPassword'
	})
});

Cypress.Commands.add('wipeInitialSetup', () => {
	const wipeConfig = (authToken) => {
		cy.request({
			method: 'PUT',
			url: '/api/config',
			headers: { Authorization: 'Bearer ' + authToken },
			body: {
				users: [],
				mount_dirs: []
			}
		})
	}

	cy.request('GET', '/api/initial_setup')
		.then(response => {
			if (response.body.has_any_users) {
				cy.getAuthToken().then(response => wipeConfig(response.body.token))
			} else {
				wipeConfig(null)
			}
		})
})

Cypress.Commands.add('completeInitialSetup', () => {

	const waitForCollectionIndex = () => {
		cy.getAuthToken().then(response => {
			const authToken = response.body.token;
			cy.request({
				url: '/api/browse',
				headers: { Authorization: 'Bearer ' + authToken }
			})
				.then((resp) => {
					if (resp.status == 200) {
						if (resp.body != []) {
							return
						}
					}
					waitForCollectionIndex()
				})
		});
	}

	cy.request('/api/initial_setup')
		.then(response => {
			if (response.body.has_any_users) {
				return
			}

			cy.request('PUT', '/api/config', {
				users: [{
					name: 'testUser',
					password: 'testPassword',
					admin: true
				}],
				mount_dirs: [{
					source: 'test-data/small-collection',
					name: 'Test'
				}]
			})
		})

	cy.triggerIndex()
	waitForCollectionIndex()
})

Cypress.Commands.add('triggerIndex', () => {
	cy.getAuthToken().then(response => {
		const authToken = response.body.token;
		cy.request({
			method: 'POST',
			url: '/api/trigger_index',
			headers: { Authorization: 'Bearer ' + authToken }
		})
	})
});

Cypress.Commands.add('login', () => {
	cy.request('POST', '/api/auth', {
		username: 'testUser',
		password: 'testPassword'
	}).then((resp) => {
		window.localStorage.setItem('username', resp.body.username)
		window.localStorage.setItem('authToken', resp.body.token)
		window.localStorage.setItem('isAdmin', resp.body.is_admin)
	})
})
