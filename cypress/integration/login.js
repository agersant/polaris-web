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

});