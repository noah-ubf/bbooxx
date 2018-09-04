// import actionConsts from '../consts';
import * as _ from 'lodash';
// import fs from 'fs';
const electron = window.require('electron');
const remote = electron.remote;
const fs = remote.require('fs');
const app = remote.app;
const dialog = remote.dialog;

import bqconfig from '../libs/bqconfig';
import BQStrongs from '../libs/modules/bible_quote/strongs';

const setWindowParams = (cfg) => {
  if (!cfg) return;
  const win = remote.getCurrentWindow();
  if (_.has(cfg, 'width') && _.has(cfg, 'height')) {
    win.setSize(cfg.width, cfg.height);
  }
  if (_.has(cfg, 'x') && _.has(cfg, 'y')) {
    win.setPosition(cfg.x, cfg.y);
  }
  if (cfg.maximized) win.maximize();
  if (cfg.minimized) win.minimize();
  if (cfg.fullscreen) win.setFullScreen(cfg.fullscreen);
}

const walkDir = (dir, pattern) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      /* Recurse into a subdirectory */
      results = results.concat(walkDir(file));
    } else { 
      /* Is a file */
      // const file_type = file.split(".").pop();
      const file_name = file.split(/(\\|\/)/g).pop();
      if (file_name.toLowerCase() === "bibleqt.ini") results.push(file);
    }
  });
  return results;
}

const CONFIG_FILE_NAME = 'bbooxx.json';

export const readConfigAction = () => {
  return function (dispatch, getState) {
    const path = app.getPath('userData');
    const filename = `${path}/${CONFIG_FILE_NAME}`;
    fs.readFile(filename, (err, data) => {
      if (err) {
        dispatch({type: 'READ_CONFIG_ERROR'});
        return;
      }
      const config = JSON.parse(data.toString())
      setWindowParams(config.window);

      const modules = _.chain(config.modules).values().map(filename => {
        const text = fs.readFileSync(filename);
        const path = filename.substring(0, filename.lastIndexOf("/") + 1)
        return bqconfig(text, path, filename);
      }).compact().value();


      dispatch({
        type: 'READ_CONFIG',
        config,
        modules,
      });
    });
    // const path = filename.substring(0,filename.lastIndexOf("/") + 1)
  };
};

const getWindowConfig = () => {
  const win = remote.getCurrentWindow();
  const [width, height] = win.getSize();
  const [x, y] = win.getPosition();
  return {
    x,
    y,
    width,
    height,
    maximized: win.isMaximized(),
    minimized: win.isMinimized(),
    fullscreen: win.isFullScreen(),
  };
}

let windowUpdateConfigTimer = null;
const updateWindowConfig = (dispatch) => {
  if (windowUpdateConfigTimer) {
    clearTimeout(windowUpdateConfigTimer);
  }
  windowUpdateConfigTimer = setTimeout(() => {
    windowUpdateConfigTimer = null;
    dispatch({
      type: 'UPDATE_WINDOW_CONFIG',
      config: getWindowConfig(),
    });
  }, 100);
}

export const writeConfigAction = () => {
  return function (dispatch, getState) {
    const path = app.getPath('userData');
    const filename = `${path}/${CONFIG_FILE_NAME}`;
    fs.writeFileSync(filename, JSON.stringify({
      ...getState().config,
    }));
  };
};

export const readModuleAction = filename => {
  return function (dispatch, getState) {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
         { name: 'Bible Quote ini file', extensions: ['ini'] }
        ]
      }, filenames => {
        if (!filenames) return;
        const filename = filenames[0];
        const text = fs.readFileSync(filename);
        const path = filename.substring(0,filename.lastIndexOf("/") + 1)
        dispatch({
          type: 'ADD_MODULE',
          module: bqconfig(text, path, filename),
        });
      });
  };
};

export const scanDirectoryAction = () => {
  return function (dispatch, getState) {
    dialog.showOpenDialog({
      properties: ['openDirectory'],
    }, dirnames => {
      if (!dirnames) return;
      const dirname = dirnames[0];
      if (!dirname) return;
      let modules = [];
      let strongs = [];
      let dictionaries = [];
      _.chain(walkDir(dirname)).forEach(filename => {
        const text = fs.readFileSync(filename);
        const path = filename.substring(0, filename.lastIndexOf("/") + 1)
        if (!text || text.toString().trim() === '') {
          if (fs.existsSync(`${path}hebrew.idx`)) {
            strongs.push(new BQStrongs(`${path}hebrew.idx`));
          }
          if (fs.existsSync(`${path}greek.idx`)) {
            strongs.push(new BQStrongs(`${path}greek.idx`));
          }
        } else {
          modules.push(bqconfig(text, path, filename));
        }
      }).compact().value();

      dispatch({
        type: 'ADD_MODULES',
        modules,
        strongs,
        dictionaries,
      });
    })
  };
};

export const selectModuleAction = module => {
  return ({
    type: 'SELECT_MODULE',
    module,
  });
};

export const removeModuleAction = module => {
  return ({
    type: 'REMOVE_MODULE',
    module,
  });
};

export const selectBookAction = book => {
  return ({
    type: 'SELECT_BOOK',
    book,
  });
};

export const selectChapterAction = (chapter, verse=null) => {
  return ({
    type: 'SELECT_CHAPTER',
    chapter,
    verse,
  });
};

const SHORT_NAME_SYNONIMS = {
  russian: ['rst'],
  rststrong: ['rsts'],
}
export const goChapterAction = link => {
  return function (dispatch, getState) {
    const parts = link.split(' ').map(s => s.toLowerCase());
    let bxmodule = _.find(getState().modules, m => {
      return (m.getShortName().toLowerCase() === parts[1]);
    });
    if (!bxmodule) {
      bxmodule = _.find(getState().modules, m => {
        return (SHORT_NAME_SYNONIMS[parts[1]].indexOf(m.getShortName().toLowerCase()) !== -1);
      });
    }
    if (!bxmodule) return;
    const book = bxmodule.getBookByNum(+parts[2]);
    if (!book) return;
    const chapter = book.getChapterByNum(+parts[3]);
    dispatch({
      type: 'SELECT_CHAPTER',
      chapter,
      verse: +parts[4],
    });
  }
};

export const toggleToolbarAction = (position) => ({
  type: position === 'left' ? 'TOGGLE_TOOLBAR' : 'TOGGLE_SEARCHBAR',
});

export const searchTextAction = (searchText, module, options) => {
  console.log('searchTextAction: ', searchText, module, options)
  return function (dispatch, getState) {
    if(!searchText || getState().searchInProgress) return;
    if (options.selectedBookOnly) options = {...options, book: getState().selectedBook};
    window.SEARCH_BREAK = false;

    dispatch ({
      type: 'SEARCH_START',
      searchText,
    });

    setTimeout(() => {
      module.search(
        searchText,
        options,
        (verses, path='') => dispatch ({
          type: 'SEARCH_PORTION',
          verses,
          path,
        }),
        () => dispatch ({
          type: 'SEARCH_DONE',
        }),
        () => window.SEARCH_BREAK,
        // () => getState().searchStop, // <--- incorrect work of getState() when asynchronous
      );
    }, 10);
  }
}

export const searchStopAction = () => {
  return function (dispatch, getState) {
    window.SEARCH_BREAK = true;
    return {
      type: 'SEARCH_BREAK',
    };
  } 
};

export const copyVersesAction = verses => ({
  type: 'COPY_VERSES',
  verses
});

export const removeVersesAction = (listId, verses) => ({
  type: 'REMOVE_VERSES',
  listId,
  verses,
});

export const pasteVersesAction = listId => ({
  type: 'PASTE_VERSES',
  listId
});

export const addTabListAction = verses => ({
  type: 'ADD_TAB_LIST',
  verses
});

export const removeTabListAction = listId => ({
  type: 'REMOVE_TAB_LIST',
  listId
});

export const selectTabListAction = listId => ({
  type: 'SELECT_TAB_LIST',
  listId
});

export const toggleFullscreenAction = () => ({
  type: 'TOGGLE_FULLSCREEN',
});

export const displayStrongNumberAction = num => ({
  type: 'DISPLAY_STRONG_NUMBER',
  num,
})

export const zoomInAction = () => ({
  type: 'ZOOM_IN',
})
export const zoomOutAction = () => ({
  type: 'ZOOM_OUT',
})
export const toggleSizeAction = () => ({
  type: 'TOGGLE_UI_SIZE',
});

export const reorderAction = (id, from, to) => ({
  type: 'REORDER_LIST',
  listId: id,
  from,
  to,
});

export const saveSectionWidthAction = (section, size) => ({
  type: 'SECTION_SIZE_CHANGE',
  section,
  size,
});

export const setWindowHandlersAction = () => {
  return function (dispatch, getState) {
    const win = remote.getCurrentWindow();
    win.on('resize', e => updateWindowConfig(dispatch));
    win.on('move', e => updateWindowConfig(dispatch));
    win.on('maximize', e => updateWindowConfig(dispatch));
    win.on('unmaximize', e => updateWindowConfig(dispatch));
    win.on('minimize', e => updateWindowConfig(dispatch));
    win.on('restore', e => updateWindowConfig(dispatch));
    win.on('enter-full-screen', e => updateWindowConfig(dispatch));
    win.on('leave-full-screen', e => updateWindowConfig(dispatch));
    win.on('close', e => writeConfigAction()(dispatch, getState));
  };
};
