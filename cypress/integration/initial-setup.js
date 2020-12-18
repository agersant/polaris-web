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
    cy.get('[data-cy=source]').type('test-data/small-collection')
    cy.get('[data-cy=name').type('Test')
    cy.get('[data-cy=submit-mount-points]').click()

    cy.contains('User Account')
    cy.get('[data-cy=submit-user]').should('be.disabled')
    cy.get('[data-cy=create-username]').type('testUser')
    cy.get('[data-cy=create-password]').type('testPassword')
    cy.get('[data-cy=create-password-confirm]').type('testPassword')
    cy.get('[data-cy=submit-user]').click()

    cy.hash().should('contain', 'browse')
  })
})
