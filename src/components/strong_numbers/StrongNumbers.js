import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as _ from 'lodash';

import Button from '../button/Button';
import * as Actions from '../../actions/file';
// import VerseList from '../verse_list/VerseList';
// import SearchForm from '../search_form/SearchForm';
// import ModuleList from '../module_list/ModuleList';
// import StrongNumbers from '../strong_numbers/StrongNumbers';
// import Button from '../button/Button';

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
        <div>{ this.props.num }</div>
        <div dangerouslySetInnerHTML={{__html: this.props.content || '__Strong number is not found in your dictionaries' }} />
      </div>
    );
  }
}


function mapStateToProps(state, props) {
  return {
    num: state.strongNumber,
    content: state.strongText,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StrongNumbers);
