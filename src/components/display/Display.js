import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as _ from 'lodash';
import classNames from 'classnames';
import LangContainer from "../../libs/i18n/i18n";
import SplitterLayout from 'react-splitter-layout';
// const electron = require('electron');
import {FormattedMessage} from "react-intl";

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
  state = {

  }

  renderModuleList() {
    if (this.props.toolbarHidden) return null;
    return (
      <div className="bx-section">
        <ModuleList />
      </div>
    );
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   console.log('componentDidUpdate: ', prevProps, prevState, snapshot)
  //   if (this.props.fullScreen) {
  //     // const browserWindow = electron.remote.getCurrentWindow();
  //     // browserWindow.setFullScreen(true);
  //   }
  // }

  // renderSplitter(pos) {
  //   const label = (pos === 'left' ? this.props.toolbarHidden : !this.props.searchbarHidden)
  //     ? '> > >' : '< < <';
  //   return (
  //     <div className="bx-vsplitter" onClick={() => this.props.toggleToolbarAction(pos)}>
  //       <div className="bx-splitter-icon">{ label }</div>
  //     </div>
  //   );
  // }

  componentDidMount() {
    this.props.readConfigAction();
    this.props.setWindowHandlersAction();
  }

  renderSearch() {
    if (this.props.searchbarHidden) return null;
    return (
      <div className="bx-section bx-search-section">
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
        <VerseList
          key="fullscreen"
          listId={this.props.selectedTab}
          fullScreen={true}
        />
    )
  }

  renderTabs() {
    return (
      <div className="bx-tabs">
        <div className="bx-tabs-bar">
          <div className="bx-tabs-bar-actions">
            <FormattedMessage id={this.props.toolbarHidden ? 'tabs.showModuleList' : 'tabs.hideModuleList'}>
            {
              titleTranslated => <Button
                action={() => this.props.toggleToolbarAction('left')}
                icon={ this.props.toolbarHidden ? 'arrowRightWhite' : 'arrowLeftBlack'}
                title={titleTranslated}/>
            }
            </FormattedMessage>
          </div>
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
                    {l.name || l.config.descriptor || <FormattedMessage id="tabs.empty" />}
                  </div>
                  <div className="bx-tabs-bar-tab-close" onClick={() => this.props.selectTabListAction(l.id)}>
                    {
                      this.props.tabs.length > 1 ? (
                        <FormattedMessage id="tabs.close">
                        {
                          titleTranslated => <Button
                              action={() => this.props.removeTabListAction(l.id)}
                              icon="remove"
                              title={titleTranslated}
                              round={true}
                            />
                        }
                        </FormattedMessage>
                      ) : null
                    }
                  </div>
                </div>
              ))
            }
          </div>
          <div className="bx-tabs-bar-actions">
            <FormattedMessage id="tabs.new">
            {
              titleTranslated => <Button action={() => this.props.addTabListAction()} icon="addList" title={titleTranslated}/>
            }
            </FormattedMessage>
            <FormattedMessage id={this.props.searchbarHidden ? 'tabs.showSearch' : 'tabs.hideSearch'}>
            {
              titleTranslated => <Button
                action={() => this.props.toggleToolbarAction('right')}
                icon={ this.props.searchbarHidden ? 'arrowLeftWhite' : 'arrowRightBlack'}
                title={titleTranslated}/>
            }
            </FormattedMessage>
          </div>
        </div>
        <div className="bx-tabs-content">
          {
            this.props.tabs.map(l => (
              <div key={l.id} className={classNames({'bx-tabs-content-item': true, active: this.props.selectedTab === l.id})}>
                <VerseList
                  listId={l.id}
                />
              </div>
            ))
          }
        </div>
      </div>
    );
  }

  renderSplash() {
    return <LangContainer locale="en">
      <FormattedMessage id="splash.loading" />
    </LangContainer>; //TODO
  }

  render() {
    if (!this.props.configLoaded) return this.renderSplash();
    const body = document.getElementsByTagName("BODY")[0];
    const fontSizeUI = (this.props.windowFontSize || 20) + 'px';
    if (this.fontSizeUI !== fontSizeUI) {
      _.set(body.parentNode, 'style.fontSize', fontSizeUI);
      this.fontSizeUI = fontSizeUI;
    }

    return (
      <LangContainer locale="en">
      {
        [
          <Box key="layout" vertical={false} className={`${this.props.className} bx-layout`} hidden={this.props.fullScreen}>
            <SplitterLayout
              customClassName="bx-splitter-layout"
              primaryIndex={1}
              primaryMinSize={400}
              secondaryMinSize={200}
              secondaryInitialSize={this.props.modulesWidth || 300}
              onSecondaryPaneSizeChange={w => this.props.saveSectionWidthAction('modules', w)}
            >
              { this.renderModuleList() }
              <SplitterLayout
                primaryIndex={0}
                primaryMinSize={200}
                secondaryMinSize={200}
                secondaryInitialSize={this.props.searchWidth || 300}
                onSecondaryPaneSizeChange={w => this.props.saveSectionWidthAction('search', w)}
              >
                <div className="bx-section">
                  <SplitterLayout
                    vertical={true}
                    primaryIndex={0}
                    primaryMinSize={400}
                    secondaryMinSize={200}
                    secondaryMaxSize={this.props.strongsMaxHeight || 300}
                    onSecondaryPaneSizeChange={h => this.props.saveSectionWidthAction('strongs', h)}
                  >
                    { this.renderTabs() }
                    { this.renderStrongs() }
                  </SplitterLayout>
                </div>
                { this.renderSearch() }
              </SplitterLayout>
            </SplitterLayout>
          </Box>,
          <div className="bx-fullscreen" key="fullscreen">
            { this.renderFullScreenMode() }
          </div>
        ]
      }
      </LangContainer>
    );
  }
}


function mapStateToProps(state, props) {
  console.log('STATE: ', state)
  const lists = state.lists.map(l => ({...l, config: _.find(state.config.lists, c => (c.id === l.id))}));

  return {
    configLoaded: state.configLoaded,
    toolbarHidden: state.toolbarHidden,
    searchbarHidden: state.searchbarHidden,
    tabs: _.filter(lists, l => (l.config.type === 'tab')),
    selectedTab: state.config.selectedTab,
    fullScreen: state.fullScreen,
    strongNumber: state.strongNumber,
    fontSize: state.config.fontSize || 20,
    fontSizeFullscreen: state.config.fontSizeFullscreen || 40,
    windowFontSize: _.get(state, 'config.window.fontSize') || 20,
    modulesWidth: _.get(state, 'config.window.modulesWidth', 300),
    searchWidth: _.get(state, 'config.window.searchWidth', 300),
    strongsMaxHeight: _.get(state, 'config.window.strongsMaxHeight', 300),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Display);
