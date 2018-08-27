import React, { Component } from 'react';
import * as _ from 'lodash';

import VerseView from './VerseView';


class VerseList extends Component {
  state = {
    selected: [],
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate: ', prevProps, prevState, snapshot)
    if (prevProps.verses !== this.props.verses) {
      this.setState({
        selected: _.filter(this.props.verses, v => (this.state.selected.indexOf(v) !== -1)),
      });
    }
  }

  renderHeader() {
    if (this.props.showHeader === false) return null;
    return (
      <div className="bx-verse-list-header">
        <h1>{ this.props.title }</h1>
        <h2>{ this.props.subtitle }</h2>
      { this.props.module && this.props.module.getName() }
      </div>
    );
  }

  renderTools() {
    if (!this.props.toolbar) return null;
    return (
      <div className="bx-verse-list-toolbar">
        { this.renderToolbarButtons() }
      </div>
    );
  }

  renderToolbarButtons() {
    return [
      (_.get(this.props.toolbar, 'select')
        ? <button key="select" onClick={() => this.selectAll()}>__Select all</button> : null
      ),
      (_.get(this.props.toolbar, 'deselect')
        ? <button key="deselect" onClick={() => this.deselectAll()}>__Deselect all</button> : null
      ),
      (_.get(this.props.toolbar, 'invert')
        ? <button key="invert" onClick={() => this.invertSelection()}>__Invert selection</button> : null
      ),
      (_.get(this.props.toolbar, 'remove')
        ? <button key="remove" onClick={() => this.props.toolbar.remove(this.state.selected)}>__Remove selected</button> : null
      ),
      (_.get(this.props.toolbar, 'copy')
        ? <button key="copy" onClick={() => this.props.toolbar.copy(this.state.selected)}>__Copy</button> : null
      ),
      (_.get(this.props.toolbar, 'paste')
        ? <button key="paste" onClick={() => this.props.toolbar.paste()}>__Paste</button> : null
      ),
    ];
  }

  isSelected(verse) {
    return (this.state.selected.indexOf(verse) !== -1);
  }

  toggleSelect(verse) {
    if (this.isSelected(verse)) this.setState({selected: _.filter(this.state.selected, v => (v !== verse))});
    else this.setState({selected: [...this.state.selected, verse]})
  }

  selectAll() {
    this.setState({selected: [...this.props.verses]});
  }

  deselectAll() {
    this.setState({selected: []});
  }

  invertSelection() {
    this.setState({selected: _.filter(this.props.verses, v => !this.isSelected(v))});
  }

  render() {
    return (
      <div className="bx-verselist">
        { this.renderHeader() }
        { this.renderTools() }
        {
          _.map(this.props.verses, (v, i) => (
            <VerseView
              key={i}
              verse={v}
              onClick={() => this.toggleSelect(v)}
              showHeader={this.props.showHeader}
              selected={this.isSelected(v)}
            />
          ))
        }
      </div>
    );
  }
}

export default VerseList;
