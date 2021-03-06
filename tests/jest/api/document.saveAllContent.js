import {
  createTestUser,
  deleteTestUser,
  getPersistentAgent,
  makeTestUserPremium,
  route,
  serverReady,
  stubRecaptcha,
  uuid
} from '../_imports'
import { addDocument } from './_document.helper'
import { checkChapters, compareChapters } from './_chapter.helper'
import { checkTopics, compareTopics } from './_topic.helper'
import { checkPlans, comparePlans } from './_plan.helper'
import { compareSections } from './_section.helper'
import { checkWorkshops } from './_workshop.helper'
import writingWorkshops from '../../../models/writingWorkshop'

stubRecaptcha(test)

test('save all content', async () => {
  const app = getPersistentAgent()

  await deleteTestUser()
  await serverReady
  await createTestUser(app)
  await makeTestUserPremium()

  const doc = await addDocument(app, 'Test1')

  const chapters = ['Introduction', 'Chapter 1'].map(title => ({
    archived: false,
    content: null,
    guid: uuid(),
    title,
    topics: {}
  }))

  const topics = ['Events', 'Scenes'].map(title => ({
    archived: false,
    guid: uuid(),
    title
  }))

  const plans = ['Synopsis', 'Plot'].map(title => ({
    archived: false,
    guid: uuid(),
    title,
    sections: [`${title}-1`, `${title}-2`].map(title => ({
      archived: false,
      content: null,
      guid: uuid(),
      tags: [],
      title
    }))
  }))

  // They share a guid because they're part of the same exercise
  const workshopGuid = uuid()
  const workshops = ['It was the best of...', 'It was the worst of...'].map((title, index) => ({
    guid: workshopGuid,
    workshopName: writingWorkshops.PLOT_WORKSHOP.name,
    content: null,
    title: title,
    order: index,
    archived: false,
    date: new Date().toDateString()
  }))

  await (
    app.post(route('document/saveAll'))
    .send({
      documentGuid: doc.guid,
      chapters,
      plans,
      topics,
      workshops
    })
    .expect(200)
  )

  await checkChapters(app, doc.guid, apiChapters => {
    expect(apiChapters.length).toBe(2)
    compareChapters(doc.guid, apiChapters[0], {
      chapterGuid: chapters[0].guid,
      documentGuid: doc.guid,
      chapter: chapters[0]
    })
    compareChapters(doc.guid, apiChapters[1], {
      chapterGuid: chapters[1].guid,
      documentGuid: doc.guid,
      chapter: chapters[1]
    })
  })

  await checkTopics(app, doc.guid, apiTopics => {
    expect(apiTopics.length).toBe(2)
    compareTopics(doc.guid, apiTopics[0], {
      topicGuid: topics[0].guid,
      documentGuid: doc.guid,
      topic: topics[0]
    })
    compareTopics(doc.guid, apiTopics[1], {
      topicGuid: topics[1].guid,
      documentGuid: doc.guid,
      topic: topics[1]
    })
  })

  await checkPlans(app, doc.guid, apiPlans => {
    expect(apiPlans.length).toBe(2)

    apiPlans.forEach((apiPlan, planIndex) => {
      comparePlans(doc.guid, apiPlan, {
        planGuid: plans[planIndex].guid,
        documentGuid: doc.guid,
        plan: plans[planIndex]
      })
      apiPlan.sections.forEach((apiSection, sectionIndex) => {
        const section = plans[planIndex].sections[sectionIndex]
        compareSections(doc.guid, apiPlan.guid, apiSection, {
          sectionGuid: section.guid,
          planGuid: plans[planIndex].guid,
          documentGuid: doc.guid,
          section
        })
      })
    })
  })

  await checkWorkshops(app, doc.guid, apiWorkshops => {
    expect(apiWorkshops.length).toBe(2)

    apiWorkshops.forEach((workshop) => {
      workshop.date = new Date(workshop.date).toDateString()
    })

    expect(apiWorkshops).toMatchObject(workshops)
  })
})
