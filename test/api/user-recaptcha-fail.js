import { app, serverReady, test, wrapTest } from '../_imports'
import request from 'request-promise-native'
import sinon from 'sinon'

const route = route => `/api/user/${route}`
const sandbox = sinon.sandbox.create()
const user = { email: 'user-recaptcha-fail.js@test.com__TEST', password: 'thisismysecurepassword', captchaResponse: 'token' }

test.before('stub', t => {
  sandbox.stub(request, 'post')
  .withArgs(sinon.match({ uri: 'https://www.google.com/recaptcha/api/siteverify' }))
  .resolves({ success: false })
})

test.after('unstub', t => {
  sandbox.restore()
})

test('does not log in when captcha fails', t => {
  return serverReady.then(() => {
    return wrapTest(t,
      app.post(route('login'))
      .send(user)
      .expect(401)
    )
  })
})

test('does not sign up when captcha fails', t => {
  return serverReady.then(() => {
    return wrapTest(t,
      app.post(route('signup'))
      .send(user)
      .expect(401)
    )
  })
})