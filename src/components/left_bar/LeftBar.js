import React, { Component } from 'react';
import * as _ from 'lodash';
import {FormattedMessage} from "react-intl";
import classNames from 'classnames';

import TabBar from '../tab_bar/TabBar';
import VerseList from '../verse_list/VerseListWrapper';
import SearchForm from '../search_form/SearchForm';
import ModuleList from '../module_list/ModuleListWrapper';
import Icon from '../icon/Icon';


class LeftBar extends Component {
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

  renderModuleList() {
    return (
      <div className="bx-section">
        <ModuleList />
      </div>
    );
  }

  render() {
    let selected;
    if (this.props.selectedChapter) selected = this.props.selectedBook.getDescriptor();
    else if (this.props.selectedBook) selected = this.props.selectedBook.getDescriptor();
    else selected = this.props.selectedModule.getDescriptor();

    return (<div className="bx-tabs">
      <div className="bx-selected-descriptor">
        <span className="bx-selected-descriptor-icon">
          <Icon name="bookmark"/>
        </span>
        { selected }
      </div>
      <TabBar
        tabs={[
          {
            id: 'modules',
            title: (<span><span className="bx-tab-icon"><Icon name="book"/></span> <FormattedMessage id="tabs.moduleList" /></span>),
            onSelect: () => this.props.onSelectModules(),
          },{
            id: 'search',
            title: (<span><span className="bx-tab-icon"><Icon name="search"/></span> <FormattedMessage id="tabs.search" /></span>),
            onSelect: () => this.props.onSelectSearch(),
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
}

export default LeftBar;
