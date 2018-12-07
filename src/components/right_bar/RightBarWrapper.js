import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as _ from 'lodash';

// const electron = require('electron');

import * as Actions from '../../actions/file';
import RightBar from './RightBar';


class RightBarWrapper extends Component {
  fontSizeUI;

  render() {
    return (
      <RightBar
        selectedTabRight={this.props.selectedTabRight}
        onSelectTempListTab={ () => this.props.showTempListTabAction() }
        onSelectParallelTab={ () => this.props.selectParallelTabAction() }
        bibles={ this.props.bibles }
        selectParallelBible={ sn => this.props.selectParallelBibleAction(sn) }
      />
    );
  }
}


function mapStateToProps(state, props) {
  return {
    rightBarHidden: state.rightBarHidden,
    selectedTabRight: state.config.selectedTabRight,
    bibles: state.modules.filter(m => m.isBible()),
    parallelModule: state.config.parallelModule,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RightBarWrapper);
