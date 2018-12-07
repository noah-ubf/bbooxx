import React, { Component } from 'react';
import ReactDOM from "react-dom";
import * as _ from 'lodash';
import {FormattedMessage} from "react-intl";
import classNames from 'classnames';

import VerseView from './VerseView';
import Button from '../button/Button';


let placeholder = document.createElement("div");
placeholder.className = "placeholder";


class VerseList extends Component {
  state = {
    showStrongs: false,
    showXRefs: false,
    highlighted: null,
  };
  thisEl;
  listEl;
  dragged;
  over;
  highlightTimeout = null;
  scrollPos = 0;

  setHighlighted(highlighted) {
    this.setState({ highlighted });
    let i = this.props.verses.indexOf(highlighted);
    if (i === -1) return; // i = 'top';
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

  componentWillUnmount() {
    clearTimeout(this.highlightTimeout);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('componentDidUpdate: ', prevProps, prevState, snapshot)
    if (prevProps.verses !== this.props.verses) {
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

  renderToolbarButtons() { //
    const allSelected = this.props.verses.every(v => v.selected);
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
      (group1 && group2 ? <div key="separator" className="bx-toolbar-separator"></div> : null), //
      (tools.remove
        ? this.renderButton('trash', 'toolbar.removeSelected', () => tools.remove(this.props.verses.filter(v => v.selected)))
        : null
      ),
      (tools.copy
        ? this.renderButton('copy', 'toolbar.copy', () => this.copy())
        : null
      ),
      (tools.cut
        ? this.renderButton('cut', 'toolbar.cut', () => this.cut())
        : null
      ),
      (tools.paste
        ? this.renderButton('paste', 'toolbar.paste', () => tools.paste())
        : null
      ),
      (group1 || group2 ? <div key="separator2" className="bx-toolbar-separator"></div> : null), //
      (tools.strongs && this.props.verses.some(v => v.v.getModule().isBible())
        ? this.renderButton('hash', 'toolbar.strongs', () => this.toggleStrongs(), {highlighted: this.state.showStrongs})
        : null
      ),
      (tools.xrefs
        ? this.renderButton('xrefs', 'toolbar.xrefs', () => this.toggleXRefs(), {highlighted: this.state.showXRefs})
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
      (((group1 || group2 || group3) && tools.text) ? <div key="separator3" className="bx-toolbar-separator"></div> : null), //
      (tools.text
        ? <div key="text" className="bx-toolbar-text">{ tools.text }</div> : null
      )
    ];
  }

  getSelected() { //
    let selected = this.props.verses.filter(v => v.selected);
    if (selected.length === 0) selected = this.props.verses;
    return selected;
  }

  copy() {
    const tools = this.props.toolbar || {};
    return tools.copy(this.getSelected());
  }

  cut() {
    const tools = this.props.toolbar || {};
    return tools.cut(this.getSelected());
  }

  isSelected(verse) {
    return !!verse.selected;
  }

  toggleSelect(verse) {
    if (verse.selected) this.props.deselectVersesAction([verse]);
    else this.props.selectVersesAction([verse]);
  }

  toggleXRefs() {
    this.setState({showXRefs: !this.state.showXRefs});
  }

  toggleStrongs() {
    this.setState({showStrongs: !this.state.showStrongs});
  }

  selectAll() {
    this.props.selectVersesAction(this.props.verses);
  }

  deselectAll() {
    this.props.deselectVersesAction(this.props.verses);
  }

  invertSelection() {
    this.props.selectInverseAction(this.props.verses);
  }

  // enterFullscreenMode() {
  //   console.log('enterFullscreenMode: ', this.listEl)
  //   if (this.listEl.requestFullscreen) {
  //     this.listEl.requestFullscreen();
  //   }
  // }

  dragStart(e) {
    // console.log(e)
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
    let scrollPos = this.scrollPos;
    setTimeout(() => {
      this.refs.content.scrollTop = scrollPos;
    }, 10);
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

  rememberScroll(event) {
    this.scrollPos = this.refs.content.scrollTop;
  }

  render() {
    const fontSize = (this.props.fontSize || 20) + 'px';
    let chDescriptor = null;
    return (
      <div className="bx-verselist">
        { this.renderHeader() }
        { this.renderTools() }
        <div
          className="bx-verse-list-content"
          style={{fontSize}}
          onDragOver={this.dragOver.bind(this)}
          onScroll={event => this.rememberScroll(event)}
          ref="content"
        >
          <div ref="top" />
          {
            _.map(this.props.verses, (v, i) => {
              const oldDescriptor = chDescriptor;
              const module = v.v.getModule().getShortName();
              const bookNum = v.v.getBook().getNum();
              const chapter = v.v.getChapter().getNum();
              const verse = v.v.getNum();
              const href = `go ${module} ${bookNum} ${chapter} ${verse}`;
              const active = !!this.props.customized;
              chDescriptor = v.v.getChapter().getDescriptor();
              return [
                oldDescriptor === chDescriptor
                  ? null
                  : (
                    <div
                      key={'h' + i}
                      className={classNames({"bx-verse-list-chapter": true, "active": active})}
                    >
                      <span
                        className="bx-verse-list-chapter-content"
                        onClick={e => active && this.props.fireLink(href)}
                      >
                        { chDescriptor }
                      </span>
                    </div>
                  ),

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
                    showHeader={0&&this.props.showHeader}
                    selected={this.isSelected(v)}
                    showStrongs={this.state.showStrongs}
                    showXRefs={this.state.showXRefs}
                    fireLink={this.props.fireLink}
                    displayStrong={this.props.displayStrong}
                    showContent={true}
                    highlighted={this.state.highlighted && this.state.highlighted.v.getNum() === v.v.getNum()}
                    selectChapterAction={this.props.selectChapterAction}
                    addTabListAction={this.props.addTabListAction}
                    copyVersesAction={this.props.copyVersesAction}
                    toTempListAction={this.props.toTempListAction}
                  />
                </div>
              ]
            })
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
