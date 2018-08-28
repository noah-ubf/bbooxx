import React, { Component } from 'react';
import * as _ from 'lodash';

import VerseView from './VerseView';
import Button from '../button/Button';


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
    if (this.props.showHeader === false || (!this.props.title && !this.props.subtitle)) return null;
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
    const allSelected = (this.state.selected.length === this.props.verses.length);
    return [
      (_.get(this.props.toolbar, 'select')
        ? <Button key="select" action={() => (allSelected ? this.deselectAll() : this.selectAll())}
          icon={allSelected ? 'deselectAll' : 'selectAll'} title={allSelected ? '__Deselect all' : '__Select all'}/> : null
      ),
      (_.get(this.props.toolbar, 'deselect')
        ? <Button key="deselect" action={() => this.deselectAll()} icon="deselectAll" title="__Deselect all"/> : null
      ),
      (_.get(this.props.toolbar, 'invert')
        ? <Button key="invert" action={() => this.invertSelection()} icon="invert" title="__Invert selection"/> : null
      ),
      (<div key="separator" className="bx-toolbar-separator"></div>),
      (_.get(this.props.toolbar, 'remove')
        ? <Button key="remove" action={() => this.props.toolbar.remove(this.state.selected)} icon="trash" title="__Remove selected"/> : null
      ),
      (_.get(this.props.toolbar, 'copy')
        ? <Button key="copy" action={() => this.props.toolbar.copy(this.state.selected)} icon="copy" title="__Copy"/> : null
      ),
      (_.get(this.props.toolbar, 'paste')
        ? <Button key="paste" action={() => this.props.toolbar.paste()} icon="paste" title="__Paste"/> : null
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
        <div className="bx-verse-list-content">
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
      </div>
    );
  }
}

export default VerseList;
