import React, { Component } from 'react';
import * as _ from 'lodash';
import {FormattedMessage} from "react-intl";
import classNames from 'classnames';

import TabBar from '../tab_bar/TabBar';
import VerseList from '../verse_list/VerseListWrapper';
import Icon from '../icon/Icon';

import './index.css';


class LeftBar extends Component {
  renderTempTab() {
    return (
      <div className="bx-section bx-temptab-section">
        <VerseList
          key="temp"
          listId="temp"
        />
      </div>
    );
  }

  changeParallelBible(e) {
    this.props.selectParallelBible(e.target.value);
  }

  renderParalelTab() {
    return (
      <div className="bx-section bx-paralleltab-section">
        <select
          className="bx-parallel-select"
          onChange={ e => this.changeParallelBible(e) }
          value={ this.props.parallelModule }
        >
          <option key="-" value={null}></option>
          {
            this.props.bibles.map(bible => (
              <option
                key={ bible.getShortName() }
                value={ bible.getShortName() }
              >
                { bible.getName() }
              </option>
            ))
          }
        </select>
        <VerseList
          key="parallel"
          listId="parallel"
          additionalTools={[]}
        />
      </div>
    );
  }

  render() {
    return (<div className="bx-tabs">
      <TabBar
        tabs={[
          {
            id: 'temp',
            title: (<span><span className="bx-tab-icon"><Icon name="info"/></span> <FormattedMessage id="tabs.tempList" /></span>),
            onSelect: () => this.props.onSelectTempListTab(),
          },{
            id: 'parallel',
            title: (<span><span className="bx-tab-icon"><Icon name="parallel"/></span> <FormattedMessage id="tabs.parallelList" /></span>),
            onSelect: () => this.props.onSelectParallelTab(),
          }
        ]}
        selected={ this.props.selectedTabRight }
      />
      <div className="bx-tabs-content">
        <div key="temp" className={classNames({'bx-tabs-content-item': true, active: this.props.selectedTabRight === 'temp'})}>
          { this.renderTempTab() }
        </div>
        <div key="parallel" className={classNames({'bx-tabs-content-item': true, active: this.props.selectedTabRight === 'parallel'})}>
          { this.renderParalelTab() }
        </div>
      </div>
    </div>);
  }
}

export default LeftBar;
