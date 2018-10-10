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
      .then(() => { done() })
      .catch(done)
  })

  it('has a submit button', done => {
    nightmare
      .wait('button.submit')
      .then(() => { done() })
      .catch(done)
  })

  it('transitions to mount point setup', done => {
    nightmare
      .click('button.submit')
      .evaluate(() => document.querySelector('h2').innerHTML)
      .then(title => { expect(title).to.equal('Music Sources') })
      .then(() => { done() })
      .catch(done)
  })

  it('cannot submit prematurely', done => {
    nightmare
      .evaluate(() => document.querySelector('button.submit').disabled)
      .then(buttonDisabled => { expect(buttonDisabled).to.be.true })
      .then(() => { done() })
      .catch(done)
  })

  it('can fill out the mount point form', done => {
    nightmare
      .insert('input#source', 'test/collection')
      .insert('input#name', 'test_music')
      .evaluate(() => document.querySelector('button.submit').disabled)
      .then(buttonDisabled => { expect(buttonDisabled).to.not.be.true })
      .then(() => { done() })
      .catch(done)
  })

  it('transitions to user setup', done => {
    nightmare
      .click('button.submit')
      .evaluate(() => document.querySelector('h2').innerHTML)
      .then(title => { expect(title).to.equal('User Account') })
      .then(() => { done() })
      .catch(done)
  })

  it('cannot submit prematurely', done => {
    nightmare
      .evaluate(() => document.querySelector('button.submit').disabled)
      .then(buttonDisabled => { expect(buttonDisabled).to.be.true })
      .then(() => { done() })
      .catch(done)
  })

  it('can fill out the user account form', done => {
    nightmare
      .insert('input#username', 'agersant')
      .insert('input#password', 'very_secret')
      .insert('input#password_confirm', 'very_secret')
      .evaluate(() => document.querySelector('button.submit').disabled)
      .then(buttonDisabled => { expect(buttonDisabled).to.not.be.true })
      .then(() => { done() })
      .catch(done)
  })

  it('transitions to main page', done => {
    nightmare
      .click('button.submit')
      .wait(3000)
      .wait('main menu')
      .end()
      .then(() => { done() })
      .catch(done)
  }).timeout(5000)
})
