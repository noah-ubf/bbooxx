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
import MiddleBar from './MiddleBar';

import './index.css';


class MiddleBarWrapper extends Component {
  render() {
    return <MiddleBar

    />
  }
}


function mapStateToProps(state, props) {
  // console.log('STATE: ', state)
  const lists = state.lists.map(l => ({...l, config: _.find(state.config.lists, c => (c.id === l.id))}));

  return {
    leftBarHidden: state.leftBarHidden,
    rightBarHidden: state.rightBarHidden,
    tabs: _.filter(lists, l => (l.config.type === 'tab')),
    selectedTab: state.config.selectedTab,
    fullScreen: state.fullScreen,
    strongNumber: state.strongNumber,
    fontSize: state.config.fontSize || 20,
    fontSizeFullscreen: state.config.fontSizeFullscreen || 40,
    modulesWidth: _.get(state, 'config.window.modulesWidth', 300),
    strongsMaxHeight: _.get(state, 'config.window.strongsMaxHeight', 300),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MiddleBarWrapper);
