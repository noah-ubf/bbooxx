import React from 'react';
import glyphs from './glyphs';

export default props => {
  return (
    <svg viewBox="0 0 24 24" width={props.width} height={props.height} fill={props.fill}>
      <path {...glyphs[props.name]} />
    </svg>
  );
}