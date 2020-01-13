describe('Collection', function() {

	beforeEach(function() {
		cy.completeInitialSetup()
		cy.login()
	})

	it('can be browsed', () => {
		cy.visit('/')
		cy.contains('Music Collection')
		cy.contains('Test').click()
		cy.contains('Khemmis')
		cy.contains('Tobokegao').click()
		cy.contains('2016')
		cy.contains('Picnic').click()
		cy.contains('ブルーベリーパイ (Blueberry Pie)')
	})

	it('has breadcrumbs', () => {
		cy.visit('/')
		cy.contains('Music Collection')
		cy.contains('Test').click()
		cy.contains('Tobokegao').click()
		cy.get('[data-cy=breadcrumb]').should('have.length', 3)
	})

});