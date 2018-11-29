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
import StrongNumbers from '../strong_numbers/StrongNumbers';
import Button from '../button/Button';
import LeftBar from '../left_bar/LeftBarWrapper';

import './index.css';


const Box = props => (
  <div  {..._.omit(props, 'vertical')} style={{
    display: props.hidden ? 'none' : 'flex',
    flexDirection: (props.vertical === false ? 'row' : 'column')
  }}>
    { props.children }
  </div>
)

class MiddleBar extends Component {
  renderStrongs() {
    if (!this.props.strongNumber) return null;
    return (
      <StrongNumbers
        num={this.props.strongNumber}
        fontSize={this.props.fullScreen ? this.props.fontSizeFullscreen : this.props.fontSize}
      />
    );
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

  render() {
    return (
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
    );
  }
}

export default MiddleBar;
