import React, { Component } from 'react';
import * as _ from 'lodash';

import VerseView from './VerseView';


class VerseList extends Component {
  state = {
    descriptor: null,
    verses: [],
    selected: [],
    removed: [],
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdate: ', prevProps, prevState, snapshot)
    if (prevProps.descriptor !== this.props.descriptor) {
      this.setState({
        verses: [...this.props.verses],
        selected: [],
        removed: [],
      });
    }
    if (prevProps.verses !== this.props.verses) {
      const verses = _.filter(this.props.verses, v => !this.isRemoved(v));
      this.setState({
        verses,
        selected: _.filter(verses, v => !!_.find(this.state.selected, v)),
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
    if (!this.props.showToolbar) return null;
    return (
      <div className="bx-verse-list-toolbar">
        { this.renderToolbarButtons() }
      </div>
    );
  }

  renderToolbarButtons() {
    return [
      (<button key="select" onClick={() => this.selectAll()}>__Select all</button>),
      (<button key="deselect" onClick={() => this.deselectAll()}>__Deselect all</button>),
      (<button key="invert" onClick={() => this.invertSelection()}>__Invert selection</button>),
      (<button key="remove" onClick={() => this.removeSelected()}>__Remove selected</button>),
      (<button key="copy" onClick={() => this.props.copyVersesAction([...this.state.selected])}>__Copy</button>),
      (<button key="paste" onClick={() => this.props.pasteVersesAction(this)}>__Paste</button>),
    ];
  }

  isSelected(verse) {
    return !!_.find(this.state.selected, verse);
  }

  isRemoved(verse) {
    return !!_.find(this.state.removed, verse);
  }

  toggleSelect(verse) {
    if (this.isSelected(verse)) this.setState({selected: _.filter(this.state.selected, v => (v !== verse))});
    else this.setState({selected: [...this.state.selected, verse]})
  }

  selectAll() {
    this.setState({selected: [...this.state.verses]});
  }

  deselectAll() {
    this.setState({selected: []});
  }

  invertSelection() {
    this.setState({selected: _.filter(this.state.verses, v => !this.isSelected(v))});
  }

  removeSelected() {
    const verses = _.filter(this.state.verses, v => !this.isSelected(v));
    const removed = [...this.state.removed, ..._.filter(this.state.verses, v => this.isSelected(v))];
    this.setState({verses, removed});
  }

  render() {
    return (
      <div className="bx-verselist">
        { this.renderHeader() }
        { this.renderTools() }
        {
          this.state.verses.map((v, i) => (
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
