import React from 'react';
import classNames from 'classnames';
import glyphs from './glyphs';

export default props => {
  return (
    <svg viewBox="0 0 24 24">
      <path {...glyphs[props.name]} />
    </svg>
  );
}