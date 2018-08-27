// import actionConsts from '../consts';
import * as _ from 'lodash';
// import fs from 'fs';
const electron = window.require('electron');
const remote = electron.remote;
const fs = remote.require('fs');
const app = remote.app;
const dialog = remote.dialog;

import bqconfig from '../libs/bqconfig';

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
    // let dirname = '/Users/ozaikin/Software/BibleQuote';
    dialog.showOpenDialog({
      properties: ['openDirectory'],
    }, dirnames => {
      if (!dirnames) return;
      const dirname = dirnames[0];
      if (!dirname) return;
      const modules = _.chain(walkDir(dirname)).map(filename => {
        const text = fs.readFileSync(filename);
        const path = filename.substring(0, filename.lastIndexOf("/") + 1)
        return bqconfig(text, path, filename);
      }).compact().value();

      dispatch({
        type: 'ADD_MODULES',
        modules
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

export const selectChapterAction = chapter => {
  return ({
    type: 'SELECT_CHAPTER',
    chapter,
  });
};

export const toggleToolbarAction = (position) => ({
  type: position === 'left' ? 'TOGGLE_TOOLBAR' : 'TOGGLE_SEARCHBAR',
});

export const searchTextAction = (searchText, module, options) => {
  console.log('searchTextAction: ', searchText, module, options)
  return function (dispatch, getState) {
    if(!searchText || getState.searchInProgress) return;
    dispatch ({
      type: 'SEARCH_START',
      searchText,
    });
    let stopped = false;

    // const unsubscribe = store.subscribe(handleChange) ???
    // unsubscribe()

    setTimeout(() => {
      module.search(
        searchText,
        options,
        (verses) => dispatch ({
          type: 'SEARCH_PORTION',
          verses,
        }),
        (verses) => dispatch ({
          type: 'SEARCH_DONE',
        }),
        () => stopped,
      );
    }, 10);
  }
}

export const searchStopAction = () => ({
  type: 'SEARCH_BREAK',
});

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

export const tempAction = (verse) => {
  return function (dispatch, getState) {
    console.log('tempAction:', verse);
    if (!verse) return;
    verse.parseLexems();
    console.log('LEXEMS:', verse.lexems);
  };
};
