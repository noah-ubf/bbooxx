import React from 'react';
import classNames from 'classnames';
import Icon from '../icon/Icon';

export default props => {
  const classes = classNames({
    "bx-button": true,
    "bx-button-round": props.round,
    "bx-button-highlighted": props.highlighted,
    "bx-button-disabled": props.disabled,
  });

  return (
    <div className={classes} title={props.title} onClick={e => {
      e.stopPropagation();
      props.disabled || (props.action && props.action(e));
    }}>
      <Icon name={props.icon} />
    </div>
  );
}