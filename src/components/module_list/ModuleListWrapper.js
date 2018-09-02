import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as _ from 'lodash';

// const electron = require('electron');

import * as Actions from '../../actions/file';
import ModuleList from './ModuleList';

import './index.css';


class ModuleListWrapper extends Component {
  fontSizeUI;

  render() {
    return (
      <ModuleList
        modules={this.props.modules}
        books={this.props.books}
        selectedModule={this.props.selectedModule}
        selectedBook={this.props.selectedBook}
        selectedChapter={this.props.selectedChapter}
        selectModule={module => this.props.selectModuleAction(module)}
        selectBook={book => this.props.selectBookAction(book)}
        selectChapter={chapter => this.props.selectChapterAction(chapter)}
        removeModule={module => this.props.removeModuleAction(module)}
      />
    );
  }
}


function mapStateToProps(state, props) {
  return {
    modules: state.modules,
    books: state.books,
    selectedModule: state.selectedModule,
    selectedBook: state.selectedBook,
    selectedChapter: state.selectedChapter,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ModuleListWrapper);
