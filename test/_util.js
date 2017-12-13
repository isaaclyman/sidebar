const accountTypes = require('../models/accountType')
const modelUtil = require('../models/_util')
const util = {}

/*
  ROUTES
*/

const route = route => `/api/${route}`
util.route = route

/*
  TEST USER
*/

const user = { email: 'user.js@test.com__TEST', password: 'thisismysecurepassword', captchaResponse: 'token' }
util.user = user

util.createTestUser = function (knex) {
  return modelUtil.getHash(user.password).then(hash => {
    return (
      knex('users').insert(modelUtil.addTimestamps(knex, {
        email: user.email,
        password: hash,
        'account_type': accountTypes.LIMITED.name
      }))
    )
  })
}

util.deleteTestUser = function (knex, email) {
  email = email || user.email

  return (
    knex('users').where('email', email).first('id').then(testUser => {
      if (testUser === undefined) {
        return
      }

      const testUserId = testUser.id

      const tablesToDeleteFrom = [
        'documents', 'document_orders', 'chapters', 'chapter_orders', 'master_topics', 'master_topic_orders',
        'plans', 'plan_orders', 'sections', 'section_orders', 'chapter_topics'
      ]

      const deletePromises = tablesToDeleteFrom.map(table => {
        return knex(table).where('user_id', testUserId).del()
      })

      return Promise.all(deletePromises)
    }).then(() => knex('users').where('email', email).del())
  )
}

util.makeTestUserPremium = function (knex) {
  return (
    knex('users').where('email', user.email).update({
      'account_type': accountTypes.PREMIUM.name
    })
  )
}

/*
  EXTERNAL REQUEST STUBBING
*/

const request = require('request-promise-native')
const sinon = require('sinon')

util.stubRecaptcha = function (test) {
  const sandbox = sinon.sandbox.create()

  test.before('stub recaptcha request', t => {
    sandbox.stub(request, 'post')
    .withArgs(sinon.match({ uri: 'https://www.google.com/recaptcha/api/siteverify' }))
    .resolves({ success: true })
  })

  test.after('unstub recaptcha request', t => {
    sandbox.restore()
  })
}

/*
  SUPERTEST WRAPPING
*/

util.wrapTest = function (t, supertest) {
  return new Promise((resolve, reject) => {
    supertest.end((err, res) => {
      if (err) {
        t.fail(err)
        return reject()
      }
      return resolve()
    })
  })
}

module.exports = util
