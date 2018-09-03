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
    if (!list) return null;
    if (this.props.fullScreen) {
      return {
        closeFullscreen: () => this.props.toggleFullscreenAction(),
        text: (list.config.name || list.config.descriptor),
        zoomIn: list.id !== 'search' ? () => this.props.zoomInAction() : null,
        zoomOut: list.id !== 'search' ? () => this.props.zoomOutAction() : null,
      }
    }
    return {
      select: true,
      invert: true,
      remove: verses => this.props.removeVersesAction(list.id, verses),
      copy: verses => this.props.copyVersesAction(verses),
      paste: list.id === 'search' ? null : () => this.props.pasteVersesAction(list.id),
      strongs: list.id !== 'search' ? (num) => this.props.showStrongsAction(num) : null,
      zoomIn: list.id !== 'search' ? () => this.props.zoomInAction() : null,
      zoomOut: list.id !== 'search' ? () => this.props.zoomOutAction() : null,
      fullscreen: list.id !== 'search' ? () => this.props.toggleFullscreenAction() : null,
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
    />
  }
}


function mapStateToProps(state, props) {
  const list = {
    ..._.find(state.lists, l => (l.id === props.listId)),
    config: _.find(state.config.lists, c => (c.id === props.listId))
  };

  return {
    list,
    isSelected: (props.listId === state.selectedTab),
    // fullScreen: state.fullScreen,
    fontSize: state.config.fontSize || 20,
    fontSizeFullscreen: state.config.fontSizeFullscreen || 44,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(VerseListWrapper);
