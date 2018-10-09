const Nightmare = require('nightmare')
const assert = require('assert')

describe('Load a Page', function() {
  this.timeout('20s')

  let nightmare = null
  beforeEach(() => {
    nightmare = new Nightmare()
  })

  describe('/ (Home Page)', () => {
    it('should load without error', done => {
      nightmare.goto('http://localhost:5050')
        .end()
        .then(function (result) { done() })
        .catch(done)
    })
  })
})