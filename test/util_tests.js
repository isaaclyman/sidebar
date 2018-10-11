import {
  accountTypes,
  knex,
  stubRecaptcha,
  user
} from './_imports'
import {
  createTestUser,
  deleteTestUser,
  makeTestUserPremium
} from './_util'

stubRecaptcha(test)

test('delete test user', async done => {
  await deleteTestUser(knex)
  await knex('users').where('email', user.email).first().then(user => {
    if (user) {
      done.fail()
      return
    }
  })
})

test('create test user', async done => {
  await deleteTestUser(knex)
  await createTestUser(knex)
  await knex('users').where('email', user.email).first().then(user => {
    if (user) {
      return
    }

    done.fail()
  })
})

test('get test user by id', async done => {
  await deleteTestUser(knex)
  const user = await createTestUser(knex)
  await knex('users').where('id', user.id).first().then(user => {
    if (user) {
      return
    }

    done.fail()
  })
})

test('make test user premium', async done => {
  await deleteTestUser(knex)
  await createTestUser(knex)
  await makeTestUserPremium(knex)
  await knex('users').where('email', user.email).first().then(user => {
    if (user['account_type'] === accountTypes.PREMIUM.name) {
      return
    }

    done.fail()
  })
})
