import React, { Component } from 'react';
import ReactDOM from "react-dom";
import * as _ from 'lodash';
import {FormattedMessage} from "react-intl";

import VerseView from './VerseView';
import Button from '../button/Button';


let placeholder = document.createElement("div");
placeholder.className = "placeholder";


class VerseList extends Component {
  state = {
    selected: [],
    showStrongs: false,
    highlighted: null,
  };
  thisEl;
  listEl;
  dragged;
  over;
  highlightTimeout = null;

  setHighlighted(highlighted) {
    this.setState({ highlighted });
    let i = this.props.verses.indexOf(highlighted);
    if (i === -1) i = 0;
    if (this.refs[i]) {
      this.refs[i].scrollIntoView({block: 'center', behavior: 'smooth'});
    }
    clearTimeout(this.highlightTimeout);
    this.highlightTimeout = setTimeout(() => {
      this.setState({highlighted: null});
    }, 5000);
  }

  componentDidMount() {
    window.addEventListener("click", this.documentClickHandler);
    const thisEl = ReactDOM.findDOMNode(this);
    this.listEl = thisEl.getElementsByClassName('bx-verse-list-content')[0];
    if (this.props.highlighted) {
      this.setHighlighted(this.props.highlighted);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('componentDidUpdate: ', prevProps, prevState, snapshot)
    if (prevProps.verses !== this.props.verses) {
      this.setState({
        selected: _.filter(this.props.verses, v => (this.state.selected.indexOf(v) !== -1)),
      });
      this.setHighlighted(this.props.highlighted)
    }
    if (prevProps.highlighted !== this.props.highlighted) {
      this.setHighlighted(this.props.highlighted)
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

  renderButton(icon, title, action, params) {
    return (
      <FormattedMessage id={title} key={title}>
      {
        titleTranslated => <Button action={action} icon={icon} title={titleTranslated} {...params}/>
      }
      </FormattedMessage>
    );
  }

  renderToolbarButtons() {
    const allSelected = (this.state.selected.length === this.props.verses.length);
    const tools = this.props.toolbar || {};
    const group1 = tools.select || tools.invert;
    const group2 = tools.remove || tools.copy || tools.paste;
    const group3 = tools.fullscreen || tools.closeFullscreen;
    return [
      ((tools.prevChapter || tools.nextChapter)
        ? this.renderButton(
          'prev',
          'toolbar.prevChapter',
          () => (tools.prevChapter && tools.prevChapter()),
          {
            disabled: !tools.prevChapter
          }
        )
        : null
      ),
      ((tools.prevChapter || tools.nextChapter)
        ? this.renderButton(
          'next',
          'toolbar.nextChapter',
          () => (tools.nextChapter && tools.nextChapter()),
          {
            disabled: !tools.nextChapter
          }
        )
        : null
      ),
      (tools.select
        ? this.renderButton(
          allSelected ? 'deselectAll' : 'selectAll',
          allSelected ? 'toolbar.deselectAll' : 'toolbar.selectAll',
          () => (allSelected ? this.deselectAll() : this.selectAll()))
        : null
      ),
      (tools.invert
        ? this.renderButton('invert', 'toolbar.invertSelection', () => this.invertSelection())
        : null
      ),
      (group1 && group2 ? <div key="separator" className="bx-toolbar-separator"></div> : null),
      (tools.remove
        ? this.renderButton('trash', 'toolbar.removeSelected', () => tools.remove(this.state.selected))
        : null
      ),
      (tools.copy
        ? this.renderButton('copy', 'toolbar.copy', () => this.copy())
        : null
      ),
      (tools.paste
        ? this.renderButton('paste', 'toolbar.paste', () => tools.paste())
        : null
      ),
      (group1 || group2 ? <div key="separator2" className="bx-toolbar-separator"></div> : null),
      (tools.strongs && this.props.verses.some(v => v.hasStrongs())
        ? this.renderButton('hash', 'toolbar.strongs', () => this.toggleStrongs(), {highlighted: this.state.showStrongs})
        : null
      ),
      (tools.zoomIn
        ? this.renderButton('zoomIn', 'toolbar.zoomIn', () => tools.zoomIn())
        : null
      ),
      (tools.zoomOut
        ? this.renderButton('zoomOut', 'toolbar.zoomOut', () => tools.zoomOut())
        : null
      ),
      (tools.fullscreen
        ? this.renderButton('fullscreen', 'toolbar.fullscreen', () => tools.fullscreen())
        : null
      ),
      (tools.closeFullscreen
        ? this.renderButton('closeFullscreen', 'toolbar.closeFullscreen', () => tools.closeFullscreen())
        : null
      ),
      (((group1 || group2 || group3) && tools.text) ? <div key="separator3" className="bx-toolbar-separator"></div> : null),
      (tools.text
        ? <div key="text" className="bx-toolbar-text">{ tools.text }</div> : null
      )
    ];
  }

  copy() {
    const tools = this.props.toolbar || {};
    return tools.copy(this.state.selected.length > 0 ? this.state.selected : this.props.verses);
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
    if (!this.props.reorder || !this.dragged) return;
    this.dragged.style.display = 'block';
    placeholder.parentNode.removeChild(placeholder);
    
    // update state
    var from = Number(this.dragged.dataset.id);
    var to = Number(this.over.dataset.id);
    if(from < to) to--;
    this.dragged = null;
    this.props.reorder(from, to);
  }
  dragOver(e) {
    if (!this.props.reorder || !this.dragged) return;
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
                ref={i}
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
                  showContent={true}
                  highlighted={this.state.highlighted === v}
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
