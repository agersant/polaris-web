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
		cy.hash().should('eq', '#browse')
	})

	it('asks for credentials again after cookies expire', () => {
		cy.login()
		cy.visit('/#browse')
		cy.hash().should('eq', '#browse')
		cy.clearCookies()
		cy.visit('/#random')
		cy.hash().should('eq', '#auth')
		cy.get('[data-cy=username]')
	})

	it('starts on auth page when returning with bad cookies', () => {
		cy.login()
		cy.visit('/#browse')
		cy.hash().should('eq', '#browse')
		cy.setCookie('session', 'outdated')
		cy.visit('/')
		cy.hash().should('eq', '#auth')
		cy.get('[data-cy=username]')
	})

});