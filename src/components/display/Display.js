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
import TabBar from '../tab_bar/TabBar';
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
  //   const label = (pos === 'left' ? this.props.leftBarHidden : !this.props.rightBarHidden)
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
        <TabBar
          buttonsLeft={[
            <FormattedMessage id={this.props.leftBarHidden ? 'tabs.showModuleList' : 'tabs.hideModuleList'}>
            {
              titleTranslated => <Button
                action={() => this.props.toggleToolbarAction('left')}
                icon={ this.props.leftBarHidden ? 'arrowRightWhite' : 'arrowLeftBlack'}
                title={titleTranslated}/>
            }
            </FormattedMessage>
          ]}
          buttonsRight={[
            <FormattedMessage id="tabs.new">
            {
              titleTranslated => <Button action={() => this.props.addTabListAction()} icon="addList" title={titleTranslated}/>
            }
            </FormattedMessage>,
            <FormattedMessage id={this.props.rightBarHidden ? 'tabs.showSearch' : 'tabs.hideSearch'}>
            {
              titleTranslated => <Button
                action={() => this.props.toggleToolbarAction('right')}
                icon={ this.props.rightBarHidden ? 'arrowLeftWhite' : 'arrowRightBlack'}
                title={titleTranslated}/>
            }
            </FormattedMessage>
          ]}
          tabs={
            this.props.tabs.map(l => ({
              id: l.id,
              title: (l.name || l.config.descriptor || <FormattedMessage id="tabs.empty" />),
              customized: _.get(l, 'config.params.customized'),
              onSelect: () => this.props.selectTabListAction(l.id),
              onRemove: () => this.props.removeTabListAction(l.id),
            }))
          }
          selected={ this.props.selectedTab }
        />
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

  renderLeftBar() {
    if (this.props.leftBarHidden) return null;
    let selected;
    if (this.props.selectedChapter) selected = this.props.selectedBook.getDescriptor();
    else if (this.props.selectedBook) selected = this.props.selectedBook.getDescriptor();
    else selected = this.props.selectedModule.getDescriptor();

    return (<div className="bx-tabs">
      <div className="bx-selected-descriptor">
        <span className="mdi bx-selected-descriptor-icon">{'\uf0c0'}</span>
        { selected }
      </div>
      <TabBar
        tabs={[
          {
            id: 'modules',
            title: (<span><span className="mdi">{'\uf0be'}</span> <FormattedMessage id="tabs.moduleList" /></span>),
            onSelect: () => this.props.showModulesTabAction(),
          },{
            id: 'search',
            title: (<span><span className="mdi">{'\uf349'}</span> <FormattedMessage id="tabs.search" /></span>),
            onSelect: () => this.props.selectSearchTabAction(),
          }
        ]}
        selected={ this.props.selectedTabLeft }
      />
      <div className="bx-tabs-content">
        <div key="modules" className={classNames({'bx-tabs-content-item': true, active: this.props.selectedTabLeft === 'modules'})}>
          { this.renderModuleList() }
        </div>
        <div key="search" className={classNames({'bx-tabs-content-item': true, active: this.props.selectedTabLeft === 'search'})}>
          { this.renderSearch() }
        </div>
      </div>
    </div>);
  }

  renderRightBar () {
    if (this.props.rightBarHidden) return null;
    return (
      <VerseList
        key="fullscreen"
        listId={this.props.tempTab.id}
      />
    );
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
              { this.renderLeftBar() }
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
                { this.renderRightBar() }
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
    leftBarHidden: state.leftBarHidden,
    rightBarHidden: state.rightBarHidden,
    tabs: _.filter(lists, l => (l.config.type === 'tab')),
    tempTab: _.find(lists, l => (l.config.type === 'temp')),
    selectedTab: state.config.selectedTab,
    selectedTabLeft: state.config.selectedTabLeft,
    fullScreen: state.fullScreen,
    strongNumber: state.strongNumber,
    fontSize: state.config.fontSize || 20,
    fontSizeFullscreen: state.config.fontSizeFullscreen || 40,
    windowFontSize: _.get(state, 'config.window.fontSize') || 20,
    modulesWidth: _.get(state, 'config.window.modulesWidth', 300),
    searchWidth: _.get(state, 'config.window.searchWidth', 300),
    strongsMaxHeight: _.get(state, 'config.window.strongsMaxHeight', 300),
    selectedModule: state.selectedModule,
    selectedBook: state.selectedBook,
    selectedChapter: state.selectedChapter,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Display);
