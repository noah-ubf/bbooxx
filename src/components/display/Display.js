import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as _ from 'lodash';
import classNames from 'classnames';

// const electron = require('electron');

import * as Actions from '../../actions/file';
import VerseList from '../verse_list/VerseListWrapper';
import SearchForm from '../search_form/SearchForm';
import ModuleList from '../module_list/ModuleListWrapper';
import StrongNumbers from '../strong_numbers/StrongNumbers';
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
  fontSizeUI;

  renderModuleList() {
    if (this.props.toolbarHidden) return null;
    return <ModuleList />;
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
    if (this.props.searchbarHidden) return null;
    return (
      <div className="bx-section bx-fixed-size bx-search-section">
        <div className="bx-searchlist">
          <SearchForm />
          <VerseList
            listId="search"
            showHeader={true}
          />
        </div>
      </div>
    );
  }

  renderStrongs() {
    if (!this.props.strongNumber) return null;
    return (
      <StrongNumbers
        num={this.props.strongNumber}
        fontSize={this.props.fullScreen ? this.props.fontSizeFullscreen : this.props.fontSize}
      />
    );
  }

  renderFullScreenMode() {
    if (!this.props.fullScreen) return null;
    return (
      <div className="bx-tabs-content" key="fullscreen">
        <VerseList
          listId={this.props.selectedTab}
          fullScreen={true}
        />
      </div>
    )
  }

  render() {
    const body = document.getElementsByTagName("BODY")[0];
    const fontSizeUI = (this.props.windowFontSize || 20) + 'px';
    if (this.fontSizeUI !== fontSizeUI) {
      console.log('fontSizeUI = ', fontSizeUI)
      _.set(body.parentNode, 'style.fontSize', fontSizeUI);
      this.fontSizeUI = fontSizeUI;
    }

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
                this.props.tabs.map(l => (
                  <div key={l.id} className={classNames({'bx-tabs-content-item': true, active: this.props.selectedTab === l.id})}>
                    <VerseList
                      listId={l.id}
                    />
                    { this.renderStrongs() }
                  </div>
                ))
              }
            </div>
          </div>
        </div>
        { this.renderSplitter('right') }
        { this.renderSearch() }
      </Box>,
      this.renderFullScreenMode()
    ];
  }
}


function mapStateToProps(state, props) {
  console.log('STATE: ', state)
  const lists = state.lists.map(l => ({...l, config: _.find(state.config.lists, c => (c.id === l.id))}));

  return {
    toolbarHidden: state.toolbarHidden,
    searchbarHidden: state.searchbarHidden,
    tabs: _.filter(lists, l => (l.config.type === 'tab')),
    selectedTab: state.config.selectedTab,
    fullScreen: state.fullScreen,
    strongNumber: state.strongNumber,
    fontSize: state.config.fontSize || 20,
    fontSizeFullscreen: state.config.fontSizeFullscreen || 40,
    windowFontSize: _.get(state, 'config.window.fontSize') || 20,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Display);
