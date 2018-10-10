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
      .evaluate(() => document.querySelector('h2').innerHTML)
      .then(title => { expect(title).to.equal('Welcome to Polaris!') })
      .click('button.submit')
      .then(() => { done() })
      .catch(done)
  })

  it('can setup mount points', done => {
    nightmare
      .wait('button.submit')
      .evaluate(() => document.querySelector('h2').innerHTML)
      .then(title => { expect(title).to.equal('Music Sources') })
      .evaluate(() => document.querySelector('button.submit').disabled)
      .then(buttonDisabled => { expect(buttonDisabled).to.be.true })
      .type('input#source', 'test/collection')
      .type('input#name', 'test_music')
      .evaluate(() => document.querySelector('button.submit').disabled)
      .then(buttonDisabled => { expect(buttonDisabled).to.not.be.true })
      .click('button.submit')
      .then(() => { done() })
      .catch(done)
  })

  it('can setup first user', done => {
    nightmare
      .evaluate(() => document.querySelector('h2').innerHTML)
      .then(title => { expect(title).to.equal('User Account') })
      .evaluate(() => document.querySelector('button.submit').disabled)
      .then(buttonDisabled => { expect(buttonDisabled).to.be.true })
      .type('input#username', 'agersant')
      .type('input#password', 'very_secret')
      .type('input#password_confirm', 'very_secret')
      .evaluate(() => document.querySelector('button.submit').disabled)
      .then(buttonDisabled => { expect(buttonDisabled).to.not.be.true })
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
