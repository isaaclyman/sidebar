import ChapterStorage from './chapters.persist'
import guid from './guid'
import { LOAD_CONTENT, NUKE_CONTENT } from './chapters.store'

export const ADD_FILE = 'ADD_FILE'
export const CHANGE_FILE = 'CHANGE_FILE'
export const INIT_FILES = 'INIT_FILES'
export const SET_UP_DOCUMENT = 'SET_UP_DOCUMENT'
const LOAD_FILES = 'LOAD_FILES'
const UPDATE_FILE_METADATA = 'UPDATE_FILE_METADATA'

// Always use localStorage to store the document currently in progress
const cacheKey = 'CURRENT_DOCUMENT'
const cache = {
  getCurrentFile () {
    return JSON.parse(window.localStorage.getItem(cacheKey))
  },
  setCurrentFile (file) {
    window.localStorage.setItem(cacheKey, JSON.stringify(file))
  }
}

const store = {
  state: {
    currentFile: null, // file { id String, name String }
    ownedFiles: [] // file[]
  },
  actions: {
    [CHANGE_FILE] ({ commit }, { id, name }) {
      commit(UPDATE_FILE_METADATA, { id: null, name: null })
      commit(NUKE_CONTENT)

      const chapters = ChapterStorage.getAllChapters(id)
      const topics = ChapterStorage.getAllTopics(id)

      commit(LOAD_CONTENT, { chapters, topics })
      commit(UPDATE_FILE_METADATA, { id, name })

      cache.setCurrentFile({ id, name })
    },
    [INIT_FILES] ({ commit, dispatch }) {
      const documents = ChapterStorage.getAllDocuments()
      commit(LOAD_FILES, documents)

      const currentFile = cache.getCurrentFile()
      if (currentFile) {
        dispatch(CHANGE_FILE, currentFile)
      }
    },
    [SET_UP_DOCUMENT] ({ commit, dispatch }, { file, type }) {
      commit(ADD_FILE, file)
      dispatch(CHANGE_FILE, file)

      const chapters = type.chapters.map(title => ({
        archived: false,
        content: null,
        id: guid(),
        title,
        topics: {}
      }))

      const topics = type.topics.map(title => ({
        archived: false,
        id: guid(),
        title
      }))

      commit(LOAD_CONTENT, { chapters, topics })
      ChapterStorage.syncEverything(file.id, chapters, topics)
    }
  },
  mutations: {
    [ADD_FILE] (state, file) {
      state.ownedFiles.push(file)
      ChapterStorage.addDocument(file)
    },
    [LOAD_FILES] (state, files) {
      state.ownedFiles = files
    },
    [UPDATE_FILE_METADATA] (state, { id, name }) {
      state.currentFile = { id, name }
    }
  }
}

export default store