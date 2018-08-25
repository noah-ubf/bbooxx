import React, { Component } from 'react';
import * as _ from 'lodash';

import './index.css';


const Box = props => (
  <div  {..._.omit(props, 'vertical')} style={{
    display: 'flex',
    flexDirection: (props.vertical === false ? 'row' : 'column')
  }}>
    { props.children }
  </div>
)

const Button = props => (
  <div {...props} className={(props.className || '') + " bx-list-element"}>
    { props.children }
  </div>
)


class ModuleList extends Component {
  renderModule(module, i) {
    if (!module) return null;
    const selected = (module === this.props.selectedModule);
    return (
      <Box key={i} vertical={true}>
        <Button className={selected ? 'selected': ''}>
          <div
            className="bx-module-remove"
            title="__Remove module"
            onClick={e => { this.props.removeModule(module); e.stopPropagation();} }
          >x</div>
          <div
            className="bx-module-link"
            onClick={() => this.props.selectModule(module)}
          >
            { module.getName() }
          </div>
        </Button>
        {
          this.props.selectedModule === module
          ? (
            <Box vertical={true} className="bx-booklist">
            {
              _.chain(this.props.books).map((book, i) => this.renderBook(book, i))
              .compact()
              .value()
            }
            </Box>
          ) : null
        }
      </Box>
    );
  }

  renderBook(book, i) {
    if (!book) return null;
    const selected = (book === this.props.selectedBook);
    return (
      <Box key={i}>
        <Button className={selected ? 'selected' : null} onClick={() => this.props.selectBook(book)}>
          { book.getName() }
        </Button>
        { this.renderChapters(book) }
      </Box>
    );
  }

  renderChapters(book) {
    if (book !== this.props.selectedBook) return null;
    const chapters = book.getChapters();
    const chunx = _.chunk(chapters, 10);
    return (
      <Box>
      {
        chunx.map((row, i) => (
          <Box vertical={false} key={i}>
          {
            row.map((chapter, j) => (
              <Button
                key={j}
                className={(chapter === this.props.selectedChapter) ? 'bx-chapter-link selected': 'bx-chapter-link'}
                onClick={() => this.props.selectChapter(chapter)}
              >{ chapter.getName() }</Button>
            ))
          }
          </Box>
        ))
      }
      </Box>
    );
  }

  render() {
    return (
      <div className="bx-modulelist">
      {
        _.chain(this.props.modules)
        .map((module, i) => this.renderModule(module, i))
        .compact()
        .value()
      }
      </div>
    );
  }
}

export default ModuleList;
