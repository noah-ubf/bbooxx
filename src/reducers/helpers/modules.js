import * as _ from 'lodash';

class ModulesHelper {
  selectModule(state, module, toggle=true) {
    const books = module.getBooks();
    if (state.selectedModule === module && toggle) {
      if (state.books.length) {
        return { ...state, books: [] };
      }
      return { ...state, books };
    }

    const chapters = books.length === 1 ? books[0].getChapters() : [];

    return {
      ...state,
      config: {
        ...state.config,
        selectedModule: module.getShortName(),
      },
      selectedModule: module,
      selectedBook: books.length === 1 ? books[0] : null,
      selectedChapter: chapters.length === 1 ? chapters[0] : null,
      selectedVerse: null,
      books
    };
  }

  selectBook(state, book) {
    if (book.getChapters().length === 1) {
      return this.selectChapter(state, book.getChapters()[0]);
    }

    return {
      ...state,
      config: {
        ...state.config,
        selectedModule: book.getModule().getShortName(),
        selectedBook: book.getShortName(),
      },
      selectedModule: book.getModule(),
      selectedBook: book,
      selectedVerse: null,
    };
  }

  selectChapter(state, chapter, verse) {
    const verses = chapter.getVerses();
    const descriptor = chapter.getDescriptor();
    let targetList = _.find(state.config.lists, l => (l.id === state.config.selectedTab && !_.get(l, 'params.customized')))
      || _.find(state.config.lists, l => (l.type === 'tab' && !_.get(l, 'params.customized') && _.get(l, 'descriptor', '') === ''));
    const isNewList = !targetList;
    targetList = targetList  || {
        id: this.uniqueId(state),
        type: 'tab',
        descriptor: chapter.getDescriptor(),
      };
    const listConfigs = isNewList
      ? [ ...state.config.lists, targetList ]
      : state.config.lists.map(l => ((l.id !==targetList.id) ? l : { ...l, descriptor }));
    const lists = isNewList
      ? [ ...state.lists, { id: targetList.id, chapter, verses } ]
      : state.lists.map(l => ((l.id !==targetList.id) ? l : { ...l, chapter, verses }));

    return {
      ...state,
      config: {
        ...state.config,
        lists: listConfigs,
        selectedModule: chapter.getModule().getShortName(),
        selectedBook: chapter.getBook().getShortName(),
        selectedChapter: chapter.getNum(),
        selectedTab: targetList.id,
      },
      selectedModule: chapter.getModule(),
      selectedBook: chapter.getBook(),
      selectedChapter: chapter,
      selectedVerse: verse,
      books: chapter.getModule().getBooks(),
      lists
    };
  }

  uniqueId(state) {
    const ids = _.chain(state.lists)
      .filter(l => !_.isNaN(+l.id))
      .map(l => +l.id)
      .value();
    const maxId = Math.max(...ids);
    return (maxId + 1).toString();
  }

  remove(state, module) {
    if (state.selectedModule === module) {
      const config = {
        ...state.config,
        selectedModule: null,
        selectedBook: null,
        selectedChapter: null,
      };
      return {
        ...state,
        config,
        selectedModule: null,
        selectedBook: null,
        selectedChapter: null,
        books: [],
      };
    }
    const config = {
      ...state.config,
      modules: _.omit(state.config.modules, module.getShortName())
    };
    return {
      ...state,
      modules: _.filter(state.modules, m => (m !== module)),
      config,
    };
  }
}

export default new ModulesHelper();