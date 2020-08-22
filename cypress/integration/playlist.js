describe('Playlist', function() {

	beforeEach(function() {
		cy.clearLocalStorage();
		cy.completeInitialSetup()
		cy.login()
	})

	it('can queue individual track', () => {
		cy.visit('/')
		cy.contains('Music Collection')
		cy.contains('Test').click()
		cy.contains('Tobokegao').click()
		cy.contains('Picnic').click()
		cy.contains('ブルーベリーパイ (Blueberry Pie)').click()
		cy.get('[data-cy=playlist]').find('[data-cy=track]').contains('ブルーベリーパイ (Blueberry Pie)')
	})

	it('can use queue all button for album', () => {
		cy.visit('/')
		cy.contains('Music Collection')
		cy.contains('Test').click()
		cy.contains('Tobokegao').click()
		cy.contains('Picnic').click()
		cy.contains('Queue All').click()
		cy.get('[data-cy=playlist]').find('[data-cy=track]').should('have.length', 7)
	})

	it('can use queue all button for multiple albums', () => {
		cy.visit('/')
		cy.contains('Music Collection')
		cy.contains('Test').click()
		cy.contains('Queue All').click()
		cy.get('[data-cy=playlist]').find('[data-cy=track]').should('have.length', 13)
	})

	it('can drag and drop an individual track', () => {
		cy.visit('/')
		cy.contains('Music Collection')
		cy.contains('Test').click()
		cy.contains('Tobokegao').click()
		cy.contains('Picnic').click()
		cy.contains('ブルーベリーパイ (Blueberry Pie)').drag('[data-cy=playlist]')
		cy.get('[data-cy=playlist]').find('[data-cy=track]').contains('ブルーベリーパイ (Blueberry Pie)')
	})

	it('can drag and drop an album', () => {
		cy.visit('/')
		cy.contains('Music Collection')
		cy.contains('Test').click()
		cy.contains('Tobokegao').click()
		cy.contains('Picnic').drag('[data-cy=playlist]')
		cy.get('[data-cy=playlist]').find('[data-cy=track]').should('have.length', 7)
	})

	it('can drag and drop multiple albums', () => {
		cy.visit('/')
		cy.contains('Music Collection')
		cy.contains('Test').drag('[data-cy=playlist]')
		cy.get('[data-cy=playlist]').find('[data-cy=track]').should('have.length', 13)
	})

	it('can remove a track', () => {
		cy.visit('/')
		cy.contains('Music Collection')
		cy.contains('Test').click()
		cy.contains('Queue All').click()
		cy.get('[data-cy=playlist]').find('[data-cy=track]').first().find('[data-cy=remove]').click()
		cy.get('[data-cy=playlist]').find('[data-cy=track]').should('have.length', 12)
	})

	it('can clear the playlist', () => {
		cy.visit('/')
		cy.contains('Music Collection')
		cy.contains('Test').click()
		cy.contains('Queue All').click()
		cy.get('[data-cy=clear-playlist]').click()
		cy.get('[data-cy=playlist]').find('[data-cy=track]').should('have.length', 0)
	})

	it('can jump to a track', () => {
		cy.visit('/')
		cy.contains('Music Collection')
		cy.contains('Test').click()
		cy.contains('Queue All').click()
		cy.get('[data-cy=playlist]').find('[data-cy=track]').last().click()
		cy.get('[data-cy=playlist]').find('[data-cy=now-playing]').parents('[data-cy=track]').contains('なぜ (Why?)')
	})

	it('shows total duration', () => {
		cy.visit('/')
		cy.contains('Music Collection')
		cy.contains('Test').click()
		cy.contains('Tobokegao').click()
		cy.contains('Picnic').click()
		cy.contains('Queue All').click()
		cy.get('[data-cy=playlist-duration]').should('have.text', '21s')
	})

});