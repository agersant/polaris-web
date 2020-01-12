describe('Initial Setup', function() {

  beforeEach(function() {
    cy.wipeInitialSetup()
  })

  it('can be completed', function() {
    cy.visit('/')

    cy.contains('Welcome to Polaris!')
    cy.get('[data-cy=submit-welcome]').click()

    cy.contains('Music Sources')
    cy.get('[data-cy=submit-mount-points]').should('be.disabled')
    cy.get('input#source').type('test/collection')
    cy.get('input#name').type('test_music')
    cy.get('[data-cy=submit-mount-points]').click()

    cy.contains('User Account')
    cy.get('[data-cy=submit-user]').should('be.disabled')
    cy.get('input#username').type('testUser')
    cy.get('input#password').type('testPassword')
    cy.get('input#password_confirm').type('testPassword')
    cy.get('[data-cy=submit-user]').click()

    cy.hash().should('eq', '#browse')
  })
})
