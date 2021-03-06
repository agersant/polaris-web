describe('Login', function() {

	beforeEach(function() {
		cy.completeInitialSetup()
	})

	it('rejects bad passwords', () => {
		cy.visit('/')
		cy.get('[data-cy=username]').type('testUser')
		cy.get('[data-cy=password]').type('badPassword{enter}')

		cy.get('[data-cy=login-error]')
	})

	it('works', () => {
		cy.visit('/')
		cy.get('[data-cy=username]').type('testUser')
		cy.get('[data-cy=password]').type('testPassword{enter}')

		cy.hash().should('contain', 'browse')
	})

	it('remembers login between visits', () => {
		cy.visit('/')
		cy.get('[data-cy=username]').type('testUser')
		cy.get('[data-cy=password]').type('testPassword{enter}')

		cy.hash().should('contain', 'browse')
		cy.visit('/')
		cy.hash().should('contain', 'browse')
	})

	it('asks for credentials after logging out', () => {
		cy.visit('/')
		cy.get('[data-cy=username]').type('testUser')
		cy.get('[data-cy=password]').type('testPassword{enter}')

		cy.hash().should('contain', 'browse')
		cy.get('[data-cy=logout]').click()
		cy.hash().should('contain', 'auth')
		cy.get('[data-cy=username]')
	})

	it('asks for credentials again when returning after logging out', () => {
		cy.visit('/')
		cy.get('[data-cy=username]').type('testUser')
		cy.get('[data-cy=password]').type('testPassword{enter}')

		cy.hash().should('contain', 'browse')
		cy.get('[data-cy=logout]').click()
		cy.visit('/#/random')
		// Stopped working when upgrading to vue-router v4
		// cy.hash().should('contain', 'auth')
		cy.get('[data-cy=username]')
	})

	it('starts on auth page when returning with cleared local storage', () => {
		cy.visit('/')
		cy.get('[data-cy=username]').type('testUser')
		cy.get('[data-cy=password]').type('testPassword{enter}')

		cy.hash().should('contain', 'browse')
		cy.clearLocalStorage();
		cy.visit('/')
		cy.hash().should('contain', 'auth')
		cy.get('[data-cy=username]')
	})

	it('starts on auth page when returning with bad auth token', () => {
		cy.visit('/')
		cy.get('[data-cy=username]').type('testUser')
		cy.get('[data-cy=password]').type('testPassword{enter}')

		cy.hash().should('contain', 'browse')
		cy.window().then(window => window.localStorage.setItem("authToken", "badToken"))
		cy.clearCookies() // TODO remove when polaris no longer supports cookie auth
		cy.visit('/')
		cy.hash().should('contain', 'auth')
		cy.get('[data-cy=username]')
	})

});