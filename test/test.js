require('mocha-generators').install();

const Nightmare = require('nightmare')
const chai = require('chai')
const expect = chai.expect

const testUser = 'testUser'
const testPassword = 'testPassword'

function noop() { }

function auth(nightmare) {
  nightmare
    .goto('http://localhost:5050')
    .wait('input[name="username"]')
    .wait('input[name="password"]')
    .wait('input[type="submit"]')
    .insert('input[name="username"]', testUser)
    .insert('input[name="password"]', testPassword)
    .click('input[type="submit"]')
    .wait('main menu')
}

describe('First Time Flow', function() {

  let nightmare = new Nightmare()
  after(() => { nightmare.end(noop) })

  describe('Welcome message', function() {
    it('loads', function*() {
      var title = yield nightmare
        .goto('http://localhost:5050')
        .wait('h2')
        .evaluate(() => document.querySelector('h2').innerHTML);
      expect(title).to.equal('Welcome to Polaris!');
    })

    it('has a submit button', function*() {
      yield nightmare
        .click('button.submit')
        .wait(2000);
    })
  })

  describe('Mount points setup', function() {
    it('has a title', function*() {
      var title = yield nightmare
        .evaluate(() => document.querySelector('h2').innerHTML)
      expect(title).to.equal('Music Sources');
    })

    it('cannot be submitted prematurely', function*() {
      var buttonDisabled = yield nightmare
        .evaluate(() => document.querySelector('button.submit').disabled);
      expect(buttonDisabled).to.be.true;
    })

    it('can be filled', function*() {
      var buttonDisabled = yield nightmare
        .insert('input#source', 'test/collection')
        .insert('input#name', 'test_music')
        .evaluate(() => document.querySelector('button.submit').disabled);
      expect(buttonDisabled).to.not.be.true;

      yield nightmare
        .click('button.submit')
        .wait(2000);
    })
  })

  describe('User account setup', function() {
    it('has a title', function*() {
      var title = yield nightmare
        .evaluate(() => document.querySelector('h2').innerHTML)
      expect(title).to.equal('User Account');
    })

    it('cannot be submitted prematurely', function*() {
      var buttonDisabled = yield nightmare
        .evaluate(() => document.querySelector('button.submit').disabled);
      expect(buttonDisabled).to.be.true;
    })

    it('can be filled', function*() {
      var buttonDisabled = yield nightmare
        .insert('input#username', testUser)
        .insert('input#password', testPassword)
        .insert('input#password_confirm', testPassword)
        .evaluate(() => document.querySelector('button.submit').disabled);
      expect(buttonDisabled).to.not.be.true;

      yield nightmare
        .click('button.submit')
    })
  })

  it('Leads to main page', function*() {
    yield nightmare
      .wait('main menu')
  });

})

describe("Authentication", () => {

  let nightmare = new Nightmare()
  after(() => { nightmare.end(noop) })

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
      .insert('input[name="password"]', '')
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
  after(() => { nightmare.end(noop) })

  it('has top-level mount', done => {
    nightmare
      .wait('.directory')
      .evaluate(() => document.querySelector('.directory').innerHTML)
      .then(directoryName => { expect(directoryName).to.contain('test_music') })
      .then(() => { done() })
      .catch(done)
  })

  it('has explorer content', done => {
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
        expect(directoryNames[0]).to.contain('Khemmis')
        expect(directoryNames[1]).to.contain('Tobokegao')
      })
      .then(() => { done() })
      .catch(done)
  })

  it('has discography content', done => {
    nightmare
      .click('.directory')
      .wait('.discographyView')
      .wait('.album .cover')
      .wait('.details .title')
      .wait('.details .year')
      .evaluate(() => {
        var title = document.querySelector('.details .title').innerHTML
        var year = document.querySelector('.details .year').innerHTML
        return { title: title, year: year }
      })
      .then(data => {
        expect(data.title).to.equal('Hunted')
        expect(data.year).to.equal('2016')
      })
      .then(() => { done() })
      .catch(done)
  })

  it('has album content', done => {
    nightmare
      .click('.discographyView li')
      .wait('.albumView')
      .wait('.trackList li:nth-of-type(5)')
      .then(() => { done() })
      .catch(done)
  })

  it('has breadcrumbs', done => {
    nightmare
      .wait('breadcrumbs li:nth-of-type(4)')
      .click('breadcrumbs li')
      .wait('.explorerView')
      .then(() => { done() })
      .catch(done)
  })

  it('shows random albums', done => {
    nightmare
      .goto('http://localhost:5050#random')
      .wait('.discographyView li:nth-of-type(2)')
      .wait('browser h2')
      .evaluate(() => document.querySelector('browser h2').innerHTML)
      .then(title => { expect(title).to.include('Random') })
      .then(() => { done() })
      .catch(done)
  })

  it('shows recent albums', done => {
    nightmare
      .goto('http://localhost:5050#recent')
      .wait('.discographyView li:nth-of-type(2)')
      .wait('browser h2')
      .evaluate(() => document.querySelector('browser h2').innerHTML)
      .then(title => { expect(title).to.include('Recent') })
      .then(() => { done() })
      .catch(done)
  })
})
