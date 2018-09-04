import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ReactDOM from "react-dom";
import * as _ from 'lodash';
import {FormattedMessage} from "react-intl";

import * as Actions from '../../actions/file';
import Button from '../button/Button';

import './index.css';


class SearchForm extends Component {
  state = {
    searchText: '',
    fuzzy: false,
    selectedBookOnly: false,
    historyOpen: false,
  };

  ddButton;
  dd;
  searchInput;
  fuzzyCB;

  constructor(props) {
    super(props);
    this.documentClickHandler = this.documentClickHandler.bind(this);
  }

  componentDidMount() {
    this.setState({searchText: this.props.searchText});
    window.addEventListener("click", this.documentClickHandler);
    const thisEl = ReactDOM.findDOMNode(this);
    this.ddButton = thisEl.getElementsByClassName('bx-search-form-history-button')[0];
    this.dd = thisEl.getElementsByClassName('bx-search-form-history')[0];
    this.searchInput = thisEl.getElementsByClassName('bx-search-form-input')[0];
    this.fuzzyCB = thisEl.getElementsByClassName('bx-search-form-fuzzy')[0];
    this.caseCB = thisEl.getElementsByClassName('bx-search-form-case')[0];
    this.bookCB = thisEl.getElementsByClassName('bx-search-form-book')[0];
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.documentClickHandler);
  }

  documentClickHandler(e) {
    if (!this.state.historyOpen) { return; }
    let target = e.target;
    let parentFound = false;
    while (target != null && !parentFound) {
      if (target === this.dd || target === this.ddButton) {
        parentFound = true;
      }
      target = target.parentElement;
    }
    if (!parentFound) {
      this.hideHistory();
    }
  }

  searchHandler(event) {
    if (event.keyCode === 13) {
      this.hideHistory();
      return this.search();
    }
  }

  changeHandler(event){
    this.hideHistory();
    this.setState({searchText: event.target.value});
  }

  search() {
    if (this.state.searchText !== '') {
      const options = {
        fuzzy: this.fuzzyCB.checked,
        caseSensitive: this.caseCB.checked,
        selectedBookOnly: this.bookCB.checked,
      };
      return this.props.searchTextAction(this.state.searchText, this.props.selectedModule, options);
    }
  }

  hideHistory() {
    this.setState({historyOpen: false});
  }

  toggleHistory() {
    this.setState({historyOpen: !this.state.historyOpen});
  }

  selectFromHistory(s) {
    this.setState({
      searchText: s,
      historyOpen: false
    });
    this.searchInput.focus();
  }

  renderHistory() {
    if (!this.state.historyOpen) return null;
    return (
      <div className="bx-search-form-history">
      {
        this.props.history.map((s, i) => (
          <div key={`${s}_${i}`} className="bx-search-form-history-item" onClick={() => this.selectFromHistory(s)}>
          { s }
          </div>
        ))
      }
      </div>
    );
  }

  renderOptions() {
    return (
      <div className="bx-search-form-options">
        <label>
          <input className="bx-search-form-fuzzy" type="checkbox" value={this.state.fuzzy} />
          <span><FormattedMessage id="search.fuzzy" /></span>
        </label>
        <label>
          <input className="bx-search-form-case" type="checkbox" value={this.state.caseSensitive} />
          <span><FormattedMessage id="search.caseSensitive" /></span>
        </label>
        <label>
          <input className="bx-search-form-book" type="checkbox" value={this.state.selectedBookOnly} />
          <span><FormattedMessage id="search.selectedBook" /></span>
        </label>
      </div>
    );
  }

  renderBlocker() {
    if (!this.props.searchInProgress) return null;
    return (
      <div className="bx-search-form-blocker">
        <div className="bx-search-form-blocker-label"><FormattedMessage id="search.inProgress" /></div>
        <div className="bx-search-form-blocker-path">{ this.props.searchPath }</div>
        <div className="bx-search-form-blocker-count"><FormattedMessage id="search.found" />: <span>{ this.props.foundCount }</span></div>
        <div className="bx-search-form-blocker-stop">
          <button onClick={() => this.props.searchStopAction()}>
            <span className="mdi">{ '\uF0AD' }</span>
            <FormattedMessage id="search.stop" />
          </button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div
        className="bx-search-form"
        onKeyUp={e => this.searchHandler(e)}
      >
        <div className="bx-search-form-input-block">
          <input
            className="bx-search-form-input" 
            onChange={e => this.changeHandler(e)}
            value={this.state.searchText}
          />
          <div className="bx-search-form-submit">
            <FormattedMessage id="search.start" >
            {
              title => <Button action={() => this.search()} icon="search" title={title} round={true}/>
            }
            </FormattedMessage>
          </div>
          <FormattedMessage id="search.history" >
          {
            title => <Button action={() => this.toggleHistory()} icon="down" title={title}/>
          }
          </FormattedMessage>
        </div>
        <div className="bx-search-form-history-block">
        { this.renderHistory() }
        </div>
      { this.renderOptions() }
      { this.renderBlocker() }
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    selectedModule: state.selectedModule,
    selectedBook: state.selectedBook,
    selectedChapter: state.selectedChapter,
    searchInProgress: state.searchInProgress,
    searchText: state.searchText,
    searchHistory: state.config.searchHistory,
    searchPath: state.searchPath,
    foundCount: state.searchResult.length,
    history: state.config.searchHistory,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchForm);
