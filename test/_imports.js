import accountTypes from '../models/accountType'
import { app as server, knex, serverReady } from '../server'
import request from 'supertest'
import test from 'ava'
import {
  createTestChapter,
  createTestDocument,
  createTestUser,
  deleteTestUser,
  makeTestUserAdmin,
  makeTestUserPremium,
  route,
  setTestUserVerifyKey,
  stubRecaptcha,
  user,
  wrapTest
} from './_util'
import uuid from 'uuid/v1'

const app = request(server)
const getPersistentAgent = () => request.agent(server)
const boundCreateTestUser = async (overrideApp) => {
  await createTestUser(knex)
  return (
    (overrideApp || app).post(route('user/login'))
    .send(user)
    .expect(200)
    .then(() => {
      return user
    })
  )
}
const boundDeleteTestUser = email => deleteTestUser(knex, email)
const boundMakeTestUserAdmin = () => makeTestUserAdmin(knex)
const boundMakeTestUserPremium = () => makeTestUserPremium(knex)
const boundCreateTestDocument = () => createTestDocument(knex)
const boundCreateTestChapter = () => createTestChapter(knex)
const boundSetTestUserVerifyKey = () => setTestUserVerifyKey(knex)

export {
  accountTypes,
  app,
  boundCreateTestChapter as createTestChapter,
  boundCreateTestDocument as createTestDocument,
  boundCreateTestUser as createTestUser,
  boundDeleteTestUser as deleteTestUser,
  boundMakeTestUserAdmin as makeTestUserAdmin,
  boundMakeTestUserPremium as makeTestUserPremium,
  getPersistentAgent,
  route,
  server,
  knex,
  serverReady,
  boundSetTestUserVerifyKey as setTestUserVerifyKey,
  stubRecaptcha,
  test,
  user,
  uuid,
  wrapTest
}
