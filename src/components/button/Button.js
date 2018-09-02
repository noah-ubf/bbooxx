import React from 'react';
import classNames from 'classnames';


const ICONS = {
  next: '\uf054',
  prev: '\uf04d',
  select: '\uf135',
  deselect: '\uf131',
  selectAll: '\uf139',
  deselectAll: '\uf137',
  invert: '\uf138',
  remove: '\uf156',
  trash: '\uf1c0',
  copy: '\uf18f',
  cut: '\uf190',
  paste: '\uf192',
  addList: '\uf39d',
  addListBlack: '\uf39c',
  numbers: '\uf3a0',
  hash: '\uf423',
  pin: '\uf930',
  unpin: '\uf92f',
  fullscreen: '\uf502',//'\uf448',
  closeFullscreen: '\uf6e6',
  zoomOut: '\uf6eb',
  zoomIn: '\uf6ec',
  search: '\uf349',
  down: '\uf72d',
  todoc: '\uf191',
  info: '\uf2fd',
  listBreak: '\uf6d6',
  paralel: '\uf8de',
  gear: '\uf8ba',
};

export default props => {
  const classes = classNames({
    "bx-button": true,
    "bx-button-round": props.round,
    "bx-button-highlighted": props.highlighted,
  });

  const renderContent = () => {
    return (<span className="mdi">{ ICONS[props.icon] || props.children }</span>);
  }

  return (
    <div className={classes} title={props.title} onClick={e => {
      e.stopPropagation();
      props.action();
    }}>
      { renderContent() }
    </div>
  );
}