import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as _ from 'lodash';

import * as Actions from '../../actions/file';
import VerseList from './VerseList';

import './index.css';


class VerseListWrapper extends Component {
  getToolbar() {
    const list = this.props.list;
    const verses = _.get(list, 'verses', []).map(v => v.v);
    if (!list) return null;
    if (this.props.fullScreen) {
      return {
        closeFullscreen: () => this.props.toggleFullscreenAction(),
        text: (list.config.name || list.config.descriptor),
        zoomIn: list.id !== 'search' ? () => this.props.zoomInAction() : null,
        zoomOut: list.id !== 'search' ? () => this.props.zoomOutAction() : null,
      }
    }

    let prevChapter = null;
    let nextChapter = null;
    const chapter = _.get(this.props.list, 'chapter');
    if (chapter && list.config.type !== 'temp') {
      const prev = chapter.getPrevChapter();
      const next = chapter.getNextChapter();
      if (prev) prevChapter = () => this.props.selectChapterAction(prev);
      if (next) nextChapter = () => this.props.selectChapterAction(next);
    }

    const isTab = list.config.type === 'tab';
    const isParallel = list.config.type === 'parallel';
    return {
      select: true,
      invert: true,
      remove: isTab ? verses => this.props.removeVersesAction(list.id, verses) : null,
      copy: verses => {
        const text = verses.map(v => v.v.getText().replace(/<[^>]+>/g, '')).join('\n');
        const html = verses.map(v => v.v.getText()).join('\n');
        return this.props.copyVersesAction(verses, text, html)
      },
      cut: isTab ? verses => {
        const text = verses.map(v => v.v.getText().replace(/<[^>]+>/g, '')).join('\n');
        const html = verses.map(v => v.v.getText()).join('\n');
        return this.props.cutVersesAction(list.id, verses, text, html)
      } : null,
      paste: isTab ? () => this.props.pasteVersesAction(list.id) : null,
      strongs: isTab || isParallel ? (num) => this.props.showStrongsAction(num) : null,
      xrefs: (isTab || isParallel) && verses.some(v => v.getModule().isBible()),
      zoomIn: isTab ? () => this.props.zoomInAction() : null,
      zoomOut: isTab ? () => this.props.zoomOutAction() : null,
      fullscreen: isTab ? () => this.props.toggleFullscreenAction() : null,
      prevChapter,
      nextChapter,
    };
  }

  // renderFullScreenMode() {
  //   if (!this.props.fullScreen) return null;
  //   const currentList = this.props.lists.find(l => l.id === this.props.selectedTab);
  //   return (
  //     <div className="bx-tabs-content" key="fullscreen">
  //       <VerseList
  //         descriptor={currentList.config.descriptor}
  //         verses={currentList.verses}
  //         toolbar={this.getToolbar(currentList)}
  //         showHeader={!!_.get(currentList, 'config.params.customized')}
  //         fontSize={this.props.fullScreen ? this.props.fontSizeFullscreen : this.props.fontSize}
  //       />
  //     </div>
  //   )
  // }

  render() {
    return <VerseList
      title={this.props.title}
      subtitle={this.props.subtitle}
      descriptor={ _.get(this.props.list, 'config.descriptor') }
      verses={ _.get(this.props.list, 'verses', []) }
      toolbar={this.getToolbar()}
      showHeader={this.props.showHeader || !!_.get(this.props.list, 'config.params.customized')}
      displayStrong={num => this.props.displayStrongNumberAction(num)}
      fontSize={this.props.fullScreen ? this.props.fontSizeFullscreen : this.props.fontSize}
      reorder={(from, to) => this.props.reorderAction(this.props.listId, from, to)}
      fireLink={link => this.props.goChapterAction(link)}
      highlighted={this.props.selectedVerse}
      selectChapterAction={this.props.selectChapterAction}
      addTabListAction={this.props.addTabListAction}
      copyVersesAction={this.props.copyVersesAction}
      customized={this.props.list.id === 'search' || this.props.list.id === 'temp' || _.get(this.props.list, 'config.params.customized')}
      toTempListAction={this.props.toTempListAction}
      selectVersesAction={verses => this.props.selectVersesAction(this.props.list.id, verses)}
      deselectVersesAction={verses => this.props.deselectVersesAction(this.props.list.id, verses)}
      selectInverseAction={() => this.props.selectInverseAction(this.props.list.id)}
    />
  }
}


function mapStateToProps(state, props) {
  const list = {
    ..._.find(state.lists, l => (l.id === props.listId)),
    config: _.find(state.config.lists, c => (c.id === props.listId))
  };

  let selectedVerse = null;
  if (list.id === state.config.selectedTab) {
    selectedVerse = _.find(list.verses, v => (v.v.getNum() === state.selectedVerse));
    // console.log('STATE***: ', state, props, selectedVerse)
  }

  return {
    list,
    isSelected: (props.listId === state.selectedTab),
    // fullScreen: state.fullScreen,
    fontSize: state.config.fontSize || 20,
    fontSizeFullscreen: state.config.fontSizeFullscreen || 44,
    selectedVerse,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(VerseListWrapper);
