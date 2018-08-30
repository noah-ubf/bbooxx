import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as _ from 'lodash';

import Button from '../button/Button';
import * as Actions from '../../actions/file';
import LexemList from '../lexem_list/LexemList';

import './index.css';


class StrongNumbers extends Component {

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   console.log('componentDidUpdate: ', prevProps, prevState, snapshot)
  //   if (this.props.fullScreen) {
  //     // const browserWindow = electron.remote.getCurrentWindow();
  //     // browserWindow.setFullScreen(true);
  //   }
  // }

  render() {
    return (
      <div className="bx-strongs-section">
        <div className="bx-strongs-close">
          <Button
            action={() => this.props.displayStrongNumberAction(null)}
            icon="remove"
            title="__Close Strongs"
            round={true}
          />
        </div>
        <div>{ this.props.name }</div>
        <div>{ this.props.num }</div>
        {
          (_.get(this.props.lexems.length, 0) === 0)
          ? <div dangerouslySetInnerHTML={{__html: this.props.content || '__Strong number is not found in your dictionaries' }} />
          : <LexemList
             lexems={this.props.lexems}
            />
        }
      </div>
    );
  }
}


function mapStateToProps(state, props) {
  return {
    num: state.strongNumber,
    name: _.get(state.strongText, 'name') || '',
    lexems: _.get(state.strongText, 'lexems') || [],
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StrongNumbers);
