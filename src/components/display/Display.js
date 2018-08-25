import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import { Box, Button, TextInput } from 'proton-native';
import * as _ from 'lodash';

import * as Actions from '../../actions/file';
import VerseList from '../verse_list/VerseList';
import SearchForm from '../search_form/SearchForm';
import ModuleList from '../module_list/ModuleList';

import './index.css';


const Box = props => (
  <div  {..._.omit(props, 'vertical')} style={{
    display: 'flex',
    flexDirection: (props.vertical === false ? 'row' : 'column')
  }}>
    { props.children }
  </div>
)

class Display extends Component {
  renderModuleList() {
    if (this.props.toolbarHidden) return null;
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

  renderSplitter(pos) {
    const label = (pos === 'left' ? this.props.toolbarHidden : !this.props.searchbarHidden)
      ? '> > >' : '< < <';
    return (
      <div className="bx-vsplitter" onClick={() => this.props.toggleToolbarAction(pos)}>
        <div className="bx-splitter-icon">{ label }</div>
      </div>
    );
  }

  componentDidMount() {
    this.props.readConfigAction();
    this.props.setWindowHandlersAction();
  }

  renderSearch() {
    // console.log('SEARCH RESULTS:', this.props.searchResult)
    if (this.props.searchbarHidden) return null;
    const module = this.props.searchModule && this.props.searchModule.getDescriptor();
    return (
      <div className="bx-searchlist">
        <SearchForm
          searchText={this.props.searchText}
          search={(searchText, options) => this.props.searchTextAction(searchText, this.props.selectedModule, options)}
          history={this.props.searchHistory}
        />
        <VerseList
          descriptor={`search:${module}:${this.props.searchText}`}
          verses={this.props.searchResult}
          showHeader={true}
          showToolbar={true}
        />
      </div>
    );
  }

  render() {
    const verses = this.props.selectedChapter ? [...this.props.selectedChapter.getVerses()] : []

    return (
      <Box vertical={false} className={`${this.props.className} bx-layout`}>
        <div className="bx-section bx-fixed-size">
          { this.renderModuleList() }
        </div>
        { this.renderSplitter('left') }
        <div className="bx-section">
          <VerseList
            descriptor={this.props.selectedChapter && this.props.selectedChapter.getDescriptor()}
            verses={verses}
            showToolbar={true}
          />
        </div>
        { this.renderSplitter('right') }
        <div className="bx-section bx-fixed-size bx-search-section">
          { this.renderSearch() }
        </div>
      </Box>
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
    toolbarHidden: state.toolbarHidden,
    searchbarHidden: state.searchbarHidden,
    searchText: state.searchText,
    searchModule: state.searchModule,
    searchResult: state.searchResult,
    searchHistory: state.config.searchHistory,
    lists: state.lists,
    tabs: state.tabs,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Display);
