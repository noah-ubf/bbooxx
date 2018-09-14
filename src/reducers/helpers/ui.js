import * as _ from 'lodash';


class UIHelper {
  toggleFullscreen(state) {
    return {
      ...state,
      fullScreen: !state.fullScreen,
    };
  }

  zoomIn(state) {
    let size = (state.fullScreen ? state.config.fontSizeFullscreen : state.config.fontSize) || 20;
    if (size < 80) size += 2;
    let sizeConfig = (state.fullScreen ? {fontSizeFullscreen: size} : {fontSize: size});
    return {
      ...state,
      config: {
        ...state.config,
        ...sizeConfig,
      }
    };
  }

  zoomOut(state) {
    let size = (state.fullScreen ? state.config.fontSizeFullscreen : state.config.fontSize) || 20;
    if (size > 6) size -= 2;
    let sizeConfig = (state.fullScreen ? {fontSizeFullscreen: size} : {fontSize: size});
    return {
      ...state,
      config: {
        ...state.config,
        ...sizeConfig,
      }
    };
  }

  toggleUiSize(state) {
    let fontSize = _.get(state, 'config.window.fontSize', 16) > 16 ? 16 : 24;
    return {
      ...state,
      config: {
        ...state.config,
        window: {
          ...state.config.window,
          fontSize,
        },
      }
    };
  }

  sectionResize(state, section, size) {
    let config = {};
    switch(section) {
      case 'modules': {
        config.modulesWidth = size;
        break;
      }
      case 'search': {
        config.searchWidth = size;
        break;
      }
      case 'strongs': {
        config.strongsMaxHeight = size;
        break;
      }
      default: {
        return state;
      }
    }
    return {
      ...state,
      config: {
        ...state.config,
        window: {
          ...state.config.window,
          ...config,
        }
      }
    };
  }

  toggleModuleList(state) {
    return {
      ...state,
      config: {
        ...state.config,
        toolbarHidden: !state.toolbarHidden
      },
      toolbarHidden: !state.toolbarHidden
    };
  }

  toggleSearchBar(state) {
    return {
      ...state,
      config: {
        ...state.config,
        searchbarHidden: !state.searchbarHidden
      },
      searchbarHidden: !state.searchbarHidden
    };
  }

  updateWindow(state, config) {
    const windowConfigs = {
      maximized: config.maximized,
      minimized: config.minimized,
      fullscreen: config.fullscreen,
    };

    if (!config.maximized && !config.minimized && !config.fullscreen) {
      windowConfigs.x = config.x;
      windowConfigs.y = config.y;
      windowConfigs.width = config.width;
      windowConfigs.height = config.height;
    }

    return {
      ...state,
      config: {
        ...state.config,
        window: {
          ...state.config.window,
          ...windowConfigs,
        }
      },
    };
  }
};

export default new UIHelper();