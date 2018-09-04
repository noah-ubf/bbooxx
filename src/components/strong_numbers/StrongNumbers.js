import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as _ from 'lodash';
import {FormattedMessage} from "react-intl";

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
    const fontSize = (this.props.fontSize || 20) + 'px';
    return (
      <div className="bx-strongs-section" dir="ltr">
        <div className="bx-strongs-header">
          <div className="bx-strongs-dict-name" title={this.props.name}>{ this.props.name }</div>
          <div className="bx-strongs-close">
            <FormattedMessage id="strongs.close">
            {
              titleTranslated => <Button
                  action={() => this.props.displayStrongNumberAction(null)}
                  icon="remove"
                  title={titleTranslated}
                  round={true}
                />
            }
            </FormattedMessage>
          </div>
        </div>
        <div className="bx-strongs-toolbar">{ this.props.num }</div>
        <div className="bx-strongs-content" style={{fontSize}}>
          {
            (_.get(this.props, 'lexems.length', 0) === 0)
            ? <FormattedMessage id="strongs.notFound" />
            : <LexemList
                lexems={this.props.lexems}
                displayStrong={num => {
                  // TODO: move it to strongs convertor:
                  num = ((num[0] === '0') ? 'H' : 'G') + parseInt(num, 10);
                  this.props.displayStrongNumberAction(num);
                }}
              />
          }
        </div>
      </div>
    );
  }
}


function mapStateToProps(state, props) {
  return {
    num: state.strongNumber,
    name: _.get(state.strongText, 'name') || '',
    lexems: _.get(state.strongText, 'lexems') || [],
    fontSize: state.config.fontSize || 20,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StrongNumbers);
