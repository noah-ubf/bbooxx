import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
const electron = window.require('electron');
const { ipcRenderer } = electron;

import * as Actions from '../../actions/file';


class AppMenu extends Component {
  componentDidMount() {
    this.setAppMenu();
  }

  setAppMenu() {
    ipcRenderer.on('read-module', (event) => {
      this.props.readModuleAction();
    });

    ipcRenderer.on('scan-directory', (event) => {
      this.props.scanDirectoryAction();
    });

    ipcRenderer.on('toggle-module-list', (event) => {
      this.props.toggleToolbarAction('left');
    });

    ipcRenderer.on('toggle-search', (event) => {
      this.props.toggleToolbarAction('right');
    });

    // ipcRenderer.on('show-about', (event) => {
    //   openAboutWindow({
    //     icon_path: 'public/favicon.svg',
    //   });
    // });
  }

  render() {
    return <div></div>;
  }
}


function mapStateToProps(state, props) {
  return {
    text: state.text,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AppMenu);
