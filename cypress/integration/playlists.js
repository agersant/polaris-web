describe('Playlist', function() {

	beforeEach(function() {
		cy.completeInitialSetup()
		cy.login()
	})

	it('can save and retrieve playlist', () => {
		cy.visit('/')
		cy.contains('Music Collection')

		// Queue tracks
		cy.get('[data-cy=browser]').contains('Test').click()
		cy.get('[data-cy=browser]').contains('Tobokegao').click()
		cy.get('[data-cy=browser]').contains('Picnic').click()
		cy.contains('Queue All').click()
		cy.get('[data-cy=playlist]').find('[data-cy=track]').should('have.length', 7)

		// Save playlist
		cy.get('[data-cy=playlist-save]').click()
		cy.get('[data-cy=playlist-save-name]').type('My Playlist')
		cy.get('[data-cy=playlist-save-commit]').click()

		// Retrieve playlist
		cy.visit('/#/playlists')
		cy.contains('Playlists')
		cy.get('[data-cy=saved-playlists]').find('[data-cy=saved-playlist]').contains('My Playlist').click()
		cy.get('[data-cy=saved-playlist-details]').find('[data-cy=explorer-song]').should('have.length', 7)
	})

	it('can save and retrieve playlist with trailing question mark', () => {
		cy.visit('/')
		cy.contains('Music Collection')

		// Queue tracks
		cy.get('[data-cy=browser]').contains('Test').click()
		cy.get('[data-cy=browser]').contains('Tobokegao').click()
		cy.get('[data-cy=browser]').contains('Picnic').click()
		cy.contains('Queue All').click()
		cy.get('[data-cy=playlist]').find('[data-cy=track]').should('have.length', 7)

		// Save playlist
		cy.get('[data-cy=playlist-save]').click()
		cy.get('[data-cy=playlist-save-name]').type('Is this a playlist?')
		cy.get('[data-cy=playlist-save-commit]').click()

		// Retrieve playlist
		cy.visit('/#/playlists')
		cy.contains('Playlists')
		cy.get('[data-cy=saved-playlists]').find('[data-cy=saved-playlist]').contains('Is this a playlist?').click()
		cy.get('[data-cy=saved-playlist-details]').find('[data-cy=explorer-song]').should('have.length', 7)
	})

});