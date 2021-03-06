import React, { Component } from 'react';
import ReactDOM from "react-dom";
import * as _ from 'lodash';

import VerseView from './VerseView';
import Button from '../button/Button';


class ToolBar extends Component {
  renderToolbarButton(Tool) {
    if (Tool instanceOf Component) {
      return Tool;
    }
    const allSelected = (this.state.selected.length === this.props.verses.length);
    const tools = this.props.toolbar || {};
    const group1 = tools.select || tools.invert;
    const group2 = tools.remove || tools.copy || tools.paste;
    const group3 = tools.fullscreen || tools.closeFullscreen;
    return [
      (tools.select
        ? <Button key="select" action={() => (allSelected ? this.deselectAll() : this.selectAll())}
          icon={allSelected ? 'deselectAll' : 'selectAll'} title={allSelected ? '__Deselect all' : '__Select all'}/> : null
      ),
      (tools.invert
        ? <Button key="invert" action={() => this.invertSelection()} icon="invert" title="__Invert selection"/> : null
      ),
      (group1 && group2 ? <div key="separator" className="bx-toolbar-separator"></div> : null),
      (tools.remove
        ? <Button key="remove" action={() => tools.remove(this.state.selected)} icon="trash" title="__Remove selected"/> : null
      ),
      (tools.copy
        ? <Button key="copy" action={() => tools.copy(this.state.selected)} icon="copy" title="__Copy"/> : null
      ),
      (tools.paste
        ? <Button key="paste" action={() => tools.paste()} icon="paste" title="__Paste"/> : null
      ),
      (group1 || group2 ? <div key="separator2" className="bx-toolbar-separator"></div> : null),
      (tools.strongs && this.props.verses.some(v => v.hasStrongs())
        ? <Button key="strongs" action={() => this.toggleStrongs()} icon="hash" title="__Toggle Strongs"
            highlighted={this.state.showStrongs} /> : null
      ),
      // zoomIn: list.id !== 'search' ? () => this.props.zoomInAction() : null,
      // zoomOut: list.id !== 'search' ? () => this.props.zoomOutAction() : null,
      (tools.zoomIn
        ? <Button key="zoomIn" action={() => tools.zoomIn()} icon="zoomIn" title="__Zoom in"/> : null
      ),
      (tools.zoomOut
        ? <Button key="zoomOut" action={() => tools.zoomOut()} icon="zoomOut" title="__Zoom out"/> : null
      ),
      (tools.fullscreen
        ? <Button key="fullscreen" action={() => tools.fullscreen()} icon="fullscreen" title="__Maximize"/> : null
      ),
      (tools.closeFullscreen
        ? <Button key="closeFullscreen" action={() => tools.closeFullscreen()} icon="closeFullscreen" title="__Unmaximize" highlighted={true}/> : null
      ),
      (((group1 || group2 || group3) && tools.text) ? <div key="separator3" className="bx-toolbar-separator"></div> : null),
      (tools.text
        ? <div key="text" className="bx-toolbar-text">{ tools.text }</div> : null
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
    const fontSize = (this.props.fontSize || 20) + 'px';
    return (
      <div className="bx-verselist">
        { this.renderHeader() }
        { this.renderTools() }
        <div className="bx-verse-list-content" style={{fontSize}}>
          {
            _.map(this.props.tools, (v, i) => (
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

export default ToolBar;
