const Nightmare = require('nightmare')
const chai = require('chai')
const expect = chai.expect

describe('First Time Flow', function() {

  let nightmare = new Nightmare()

  it('should load without error', done => {
    nightmare.goto('http://localhost:5050')
      .then(function (result) { done() })
  })

  it('should have a welcome message', done => {
    nightmare.wait('#initial-setup-page')
      .evaluate(() => document.querySelector('#initial-setup-page h2').innerHTML)
      .end()
      .then(title => {
        expect(title).to.equal('Welcome to Polaris')
        done()
      })
  })
})
