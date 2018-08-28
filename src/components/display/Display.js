import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as _ from 'lodash';
import classNames from 'classnames';

// const electron = require('electron');

import * as Actions from '../../actions/file';
import VerseList from '../verse_list/VerseList';
import SearchForm from '../search_form/SearchForm';
import ModuleList from '../module_list/ModuleList';
import Button from '../button/Button';

import './index.css';


const Box = props => (
  <div  {..._.omit(props, 'vertical')} style={{
    display: props.hidden ? 'none' : 'flex',
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

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   console.log('componentDidUpdate: ', prevProps, prevState, snapshot)
  //   if (this.props.fullScreen) {
  //     // const browserWindow = electron.remote.getCurrentWindow();
  //     // browserWindow.setFullScreen(true);
  //   }
  // }

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
    const verses = _.get(this.props.searchResult, 'verses', []);
    const descriptor = this.props.searchModule && this.props.searchModule.getDescriptor(); // TODO: get it from store
    return (
      <div className="bx-searchlist">
        <SearchForm
          searchText={this.props.searchText}
          search={(searchText, options) => this.props.searchTextAction(searchText, this.props.selectedModule, options)}
          history={this.props.searchHistory}
        />
        <VerseList
          descriptor={descriptor}
          verses={verses}
          showHeader={true}
          toolbar={this.getToolbar(this.props.searchResult)}
          subtitle={verses.length > 0 ? `__Found: ${verses.length}`: null}
        />
      </div>
    );
  }

  getToolbar(list) {
    if (!list) return null;
    if (this.props.fullScreen) {
      return {
        closeFullscreen: () => this.props.toggleFullscreenAction(),
        text: (list.config.name || list.config.descriptor)
      }
    }
    return {
      select: true,
      invert: true,
      remove: verses => this.props.removeVersesAction(list.id, verses),
      copy: verses => this.props.copyVersesAction(verses),
      paste: list.id === 'search' ? null : () => this.props.pasteVersesAction(list.id),
      fullscreen: list.id !== 'search' ? () => this.props.toggleFullscreenAction() : null,
    };
  }

  renderFullScreenMode() {
    if (!this.props.fullScreen) return null;
    const currentList = this.props.lists.find(l => l.id === this.props.selectedTab);
    return (
      <div className="bx-tabs-content" key="fullscreen">
        <VerseList
          descriptor={currentList.config.descriptor}
          verses={currentList.verses}
          toolbar={this.getToolbar(currentList)}
          showHeader={!!_.get(currentList, 'config.params.customized')}
        />
      </div>
    )
  }

  render() {
    return [
      <Box key="layout" vertical={false} className={`${this.props.className} bx-layout`} hidden={this.props.fullScreen}>
        <div className="bx-section bx-fixed-size">
          { this.renderModuleList() }
        </div>
        { this.renderSplitter('left') }
        <div className="bx-section">
          <div className="bx-tabs">
            <div className="bx-tabs-bar">
              <div className="bx-tabs-bar-tabs">
                {
                  this.props.tabs.map(l => (
                    <div
                      key={l.id}
                      onClick={() => this.props.selectTabListAction(l.id)}
                      className={classNames({'bx-tabs-bar-tab': true, selected: this.props.selectedTab === l.id})}
                    >
                      <div className="bx-tabs-bar-tab-name">
                        {_.get(l, 'config.params.customized') ? '*' : ''}
                        {l.name || l.config.descriptor || '__Empty'}
                      </div>
                      <div className="bx-tabs-bar-tab-close" onClick={() => this.props.selectTabListAction(l.id)}>
                        {
                          this.props.tabs.length > 1 ? (
                            <Button
                              action={() => this.props.removeTabListAction(l.id)}
                              icon="remove"
                              title="__Close Tab"
                              round={true}
                            />
                          ) : null
                        }
                      </div>
                    </div>
                  ))
                }
              </div>
              <div className="bx-tabs-bar-actions">
                <Button action={() => this.props.addTabListAction()} icon="addList" title="__New Tab"/>
              </div>
            </div>
            <div className="bx-tabs-content">
              {
                this.props.lists.filter(l => l.config.type === 'tab').map(l => (
                  <div key={l.id} className={classNames({'bx-tabs-content-item': true, active: this.props.selectedTab === l.id})}>
                    <VerseList
                      descriptor={l.config.descriptor}
                      verses={l.verses}
                      toolbar={this.getToolbar(l)}
                      showHeader={!!_.get(l, 'config.params.customized')}
                    />
                  </div>
                ))
              }
            </div>
          </div>
        </div>
        { this.renderSplitter('right') }
        <div className="bx-section bx-fixed-size bx-search-section">
          { this.renderSearch() }
        </div>
      </Box>,
      this.renderFullScreenMode()
    ];
  }
}


function mapStateToProps(state, props) {
  console.log('STATE: ', state)
  const lists = state.lists.map(l => ({...l, config: _.find(state.config.lists, c => (c.id === l.id))}));
  const searchResult = _.find(lists, l => (l.id === 'search'));
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
    searchResult,
    searchHistory: state.config.searchHistory,
    lists,
    tabs: _.filter(lists, l => (l.config.type === 'tab')),
    selectedTab: state.config.selectedTab,
    fullScreen: state.fullScreen,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Display);
