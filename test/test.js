const Nightmare = require('nightmare')
const chai = require('chai')
const expect = chai.expect

const testUser = testUser
const testPassword = testPassword

function auth(nightmare) {
  await nightmare
    .goto('http://localhost:5050')
    .insert('input[name="username"]', testUser)
    .insert('input[name="password"]', testPassword)
    .click('input[type="submit"]')
    .wait('main menu')
}

describe('First Time Flow', () => {

  let nightmare = new Nightmare()
  after(() => { nightmare.end() })

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
      .insert('input#username', testUser)
      .insert('input#password', testPassword)
      .insert('input#password_confirm', testPassword)
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
      .then(() => { done() })
      .catch(done)
  }).timeout(5000)

})

describe("Authentication", () => {

  let nightmare = new Nightmare()
  after(() => { nightmare.end() })

  it('loads the login form', done => {
    nightmare
      .goto('http://localhost:5050')
      .wait('form')
      .then(result => { done() })
      .catch(done)
  })

  it('rejects bad passwords', done => {
    nightmare
      .insert('input[name="username"]', testUser)
      .insert('input[name="password"]', 'bad_password')
      .click('input[type="submit"]')
      .wait('p.tip.error')
      .then(() => { done() })
      .catch(done)
  })

  it('can login', done => {
    nightmare
      .insert('input[name="username"]', testUser)
      .insert('input[name="password"]', testPassword)
      .click('input[type="submit"]')
      .wait('main menu')
      .then(() => { done() })
      .catch(done)
  })

})

describe('Browse Collection', () => {

  let nightmare = new Nightmare()
  before(() => { auth(nightmare) })
  after(() => { nightmare.end() })

  it('has top-level mount', () => {
    nightmare
      .wait('.directory')
      .evaluate(() => document.querySelector('.directory').innerHTML)
      .then(directoryName => { expect(directoryName).to.equal('test_music') })
      .then(() => { done() })
      .catch(done)
  })

  it('has explorer content', () => {
    nightmare
      .click('.directory')
      .wait('.explorerView')
      .wait('li:nth-of-type(1) .directory')
      .wait('li:nth-of-type(2) .directory')
      .evaluate(() => {
        var directory1 = document.querySelector('li:nth-of-type(1) .directory').innerHTML
        var directory2 = document.querySelector('li:nth-of-type(2) .directory').innerHTML
        return [directory1, directory2]
      })
      .then(directoryNames => {
        expect(directory1).to.equal('Khemmis')
        expect(directory2).to.equal('Tobokegao')
      })
      .then(() => { done() })
      .catch(done)
  })

  it('has discography content', () => {
    nightmare
      .click('.directory')
      .wait('.discographyView')
      .wait('.album .cover')
      .wait('.details .title')
      .wait('.details .year')
      .evaluate(() => {
        var title = document.querySelector('.details .title').innerHTML
        var year = document.querySelector('.details .year').innerHTML
        return [title, year]
      })
      .then(data => {
        expect(title).to.equal('Hunter')
        expect(year).to.equal('2016')
      })
      .then(() => { done() })
      .catch(done)
  })

  it('has album content', () => {
    nightmare
      .click('.discographyView li')
      .wait('.albumView')
      .wait('.arist')
      .wait('.title')
      .wait('.tracklist')
      .wait('.tracklist li:nth-of-type(5)')
      .then(() => { done() })
      .catch(done)
  })

  it('has breadcrumbs', () => {
    nightmare
      .wait('breadcrumbs li:nth-of-type(4)')
      .click('breadcrumbs li')
      .wait('.explorerView')
      .then(() => { done() })
      .catch(done)
  })

  it('shows random albums', () => {
    nightmare
      .goto('http://localhost:5050#random')
      .wait('.discographyView li:nth-of-type(2)')
      .wait('browser h2')
      .evaluate(() => document.querySelector('browser h2').innerHTML)
      .then(title => { expect(title).to.equal('Random') })
      .then(() => { done() })
      .catch(done)
  })

  it('shows recent albums', () => {
    nightmare
      .goto('http://localhost:5050#recent')
      .wait('.discographyView li:nth-of-type(2)')
      .wait('browser h2')
      .evaluate(() => document.querySelector('browser h2').innerHTML)
      .then(title => { expect(title).to.equal('Recent') })
      .then(() => { done() })
      .catch(done)
  })
})
