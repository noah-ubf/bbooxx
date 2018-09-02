import React, { Component } from 'react';
import ReactDOM from "react-dom";
import * as _ from 'lodash';

import VerseView from './VerseView';
import Button from '../button/Button';


let placeholder = document.createElement("div");
placeholder.className = "placeholder";


class VerseList extends Component {
  state = {
    selected: [],
    showStrongs: false,
  };
  thisEl;
  listEl;
  dragged;
  over;

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

  dragStart(e) {
    if (!this.props.reorder) return;
    this.dragged = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.dragged);
    placeholder.style.height = this.dragged.offsetHeight + 'px';
    placeholder.style.opacity = 0.5;
    placeholder.innerHTML = this.dragged.innerHTML;
  }
  dragEnd(e) {
    if (!this.props.reorder) return;
    this.dragged.style.display = 'block';
    placeholder.parentNode.removeChild(placeholder);
    
    // update state
    var from = Number(this.dragged.dataset.id);
    var to = Number(this.over.dataset.id);
    if(from < to) to--;
    this.props.reorder(from, to);
  }
  dragOver(e) {
    if (!this.props.reorder) return;
    e.preventDefault();
    this.dragged.style.display = "none";
    if(e.target.className === 'placeholder') return;
    let target = e.target || {};
    while (target && target.className !== 'bx-draggable') {
      target = target.parentNode;
    }
    if (!target) return;
    this.over = target;
    target.parentNode.insertBefore(placeholder, target);
  }

  render() {
    const fontSize = (this.props.fontSize || 20) + 'px';
    return (
      <div className="bx-verselist">
        { this.renderHeader() }
        { this.renderTools() }
        <div className="bx-verse-list-content" style={{fontSize}} onDragOver={this.dragOver.bind(this)}>
          {
            _.map(this.props.verses, (v, i) => (
              <div
                key={i}
                data-id={i}
                draggable={!!this.props.reorder}
                onDragEnd={this.dragEnd.bind(this)}
                onDragStart={this.dragStart.bind(this)}
                className="bx-draggable"
              >
                <VerseView
                  verse={v}
                  onClick={() => this.toggleSelect(v)}
                  showHeader={this.props.showHeader}
                  selected={this.isSelected(v)}
                  showStrongs={this.state.showStrongs}
                  fireLink={this.props.fireLink}
                  displayStrong={this.props.displayStrong}
                />
              </div>
            ))
          }
          <div
            data-id={this.props.verses.length}
            draggable={!!this.props.reorder}
            onDragEnd={this.dragEnd.bind(this)}
            className="bx-draggable"
          >&nbsp;</div>
        </div>
      </div>
    );
  }
}

export default VerseList;




// class List extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {...props};
//   }
// }
