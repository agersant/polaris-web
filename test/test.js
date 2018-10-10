const Nightmare = require('nightmare')
const chai = require('chai')
const expect = chai.expect

describe('First Time Flow', function() {

  let nightmare = new Nightmare()

  it('loads without error', done => {
    nightmare
      .goto('http://localhost:5050')
      .then(result => { done() })
      .catch(done)
  })

  it('has a welcome message', done => {
    nightmare
      .wait('h2')
      .evaluate(() => {
        var title = document.querySelector('h2').innerHTML
        expect(title).to.equal('Welcome to Polaris!')
      })
      .click('button.submit')
      .then(() => { done() })
      .catch(done)
  })

  it('can setup mount points', done => {
    nightmare
      .wait('button.submit')
      .evaluate(() => {
        var title = document.querySelector('h2').innerHTML
        expect(title).to.equal('Music Sources')

        var submitButton = document.querySelector('button.submit')
        expect(submitButton.disabled.to.be.true)
      })
      .type('input#source', 'test/collection')
      .type('input#name', 'test_music')
      .evaluate(() => {
        var submitButton = document.querySelector('button.submit')
        expect(submitButton.disabled.to.not.be.true)
      })
      .click('button.submit')
      .then(() => { done() })
      .catch(done)
  })

  it('can setup first user', done => {
    nightmare
      .evaluate(() => {
        var title = document.querySelector('h2').innerHTML
        expect(title).to.equal('User Account')

        var submitButton = document.querySelector('button.submit')
        expect(submitButton.disabled.to.be.true)
      })
      .type('input#username', 'agersant')
      .type('input#password', 'very_secret')
      .type('input#password_confirm', 'very_secret')
      .evaluate(() => {
        var submitButton = document.querySelector('button.submit')
        expect(submitButton.disabled.to.not.be.true)
      })
      .click('button.submit')
      .then(() => { done() })
      .catch(done)
  })

  it('transitions to main page', done => {
    nightmare
      .wait('main menu')
      .end()
      .then(() => { done() })
      .catch(done)
  })
})
