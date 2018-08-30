import React, { Component } from 'react';
import ReactDOM from "react-dom";
import * as _ from 'lodash';

import VerseView from './VerseView';
import Button from '../button/Button';


class VerseList extends Component {
  state = {
    selected: [],
    showStrongs: false,
  };
  thisEl;
  listEl;

  componentDidMount() {
    window.addEventListener("click", this.documentClickHandler);
    const thisEl = ReactDOM.findDOMNode(this);
    this.listEl = thisEl.getElementsByClassName('bx-verse-list-content')[0];
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('componentDidUpdate: ', prevProps, prevState, snapshot)
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
    const group1 = _.get(this.props.toolbar, 'select') || _.get(this.props.toolbar, 'invert');
    const group2 = _.get(this.props.toolbar, 'remove') || _.get(this.props.toolbar, 'copy') || _.get(this.props.toolbar, 'paste');
    const group3 = _.get(this.props.toolbar, 'fullscreen') || _.get(this.props.toolbar, 'closeFullscreen');
    return [
      (_.get(this.props.toolbar, 'select')
        ? <Button key="select" action={() => (allSelected ? this.deselectAll() : this.selectAll())}
          icon={allSelected ? 'deselectAll' : 'selectAll'} title={allSelected ? '__Deselect all' : '__Select all'}/> : null
      ),
      (_.get(this.props.toolbar, 'invert')
        ? <Button key="invert" action={() => this.invertSelection()} icon="invert" title="__Invert selection"/> : null
      ),
      (group1 && group2 ? <div key="separator" className="bx-toolbar-separator"></div> : null),
      (_.get(this.props.toolbar, 'remove')
        ? <Button key="remove" action={() => this.props.toolbar.remove(this.state.selected)} icon="trash" title="__Remove selected"/> : null
      ),
      (_.get(this.props.toolbar, 'copy')
        ? <Button key="copy" action={() => this.props.toolbar.copy(this.state.selected)} icon="copy" title="__Copy"/> : null
      ),
      (_.get(this.props.toolbar, 'paste')
        ? <Button key="paste" action={() => this.props.toolbar.paste()} icon="paste" title="__Paste"/> : null
      ),
      (group1 || group2 ? <div key="separator2" className="bx-toolbar-separator"></div> : null),
      ((_.get(this.props.toolbar, 'strongs') && this.props.verses.some(v => v.hasStrongs()))
        ? <Button key="strongs" action={() => this.toggleStrongs()} icon="hash" title="__Toggle Strongs"
            highlighted={this.state.showStrongs} /> : null
      ),
      (_.get(this.props.toolbar, 'fullscreen')
        ? <Button key="fullscreen" action={() => this.props.toolbar.fullscreen()} icon="fullscreen" title="__Maximize"/> : null
      ),
      (_.get(this.props.toolbar, 'closeFullscreen')
        ? <Button key="closeFullscreen" action={() => this.props.toolbar.closeFullscreen()} icon="closeFullscreen" title="__Unmaximize" highlighted={true}/> : null
      ),
      (((group1 || group2 || group3) && _.get(this.props.toolbar, 'text')) ? <div key="separator3" className="bx-toolbar-separator"></div> : null),
      (_.get(this.props.toolbar, 'text')
        ? <div key="text" className="bx-toolbar-text">{_.get(this.props.toolbar, 'text')}</div> : null
      )
    ];
  }

  renderTulbarButton(id) {

  }

  isSelected(verse) {
    return (this.state.selected.indexOf(verse) !== -1);
  }

  toggleSelect(verse) {
    if (this.isSelected(verse)) this.setState({selected: _.filter(this.state.selected, v => (v !== verse))});
    else this.setState({selected: [...this.state.selected, verse]})
  }

  toggleStrongs() {
    this.setState({showStrongs: !this.state.showStrongs});
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

  // enterFullscreenMode() {
  //   console.log('enterFullscreenMode: ', this.listEl)
  //   if (this.listEl.requestFullscreen) {
  //     this.listEl.requestFullscreen();
  //   }
  // }

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
                showStrongs={this.state.showStrongs}
                displayStrong={this.props.displayStrong}
              />
            ))
          }
        </div>
      </div>
    );
  }
}

export default VerseList;
