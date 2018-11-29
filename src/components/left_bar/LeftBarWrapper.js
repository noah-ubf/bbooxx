import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as _ from 'lodash';

// const electron = require('electron');

import * as Actions from '../../actions/file';
import LeftBar from './LeftBar';


class ModuleListWrapper extends Component {
  fontSizeUI;

  render() {
    return (
      <LeftBar
        selectedTabLeft={this.props.selectedTabLeft}
        selectedModule={this.props.selectedModule}
        selectedBook={this.props.selectedBook}
        selectedChapter={this.props.selectedChapter}
        onSelectModules={ () => this.props.showModulesTabAction() }
        onSelectSearch={ () => this.props.selectSearchTabAction() }
      />
    );
  }
}


function mapStateToProps(state, props) {
  return {
    leftBarHidden: state.leftBarHidden,
    selectedTabLeft: state.config.selectedTabLeft,
    selectedModule: state.selectedModule,
    selectedBook: state.selectedBook,
    selectedChapter: state.selectedChapter,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ModuleListWrapper);
