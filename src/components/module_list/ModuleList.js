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
  state = {
    searchText: '',
  };

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
    if (chapters.length === 1) return null;
    return (
      <div className="bx-modulelist-chapters">
      {
        chapters.map((chapter, j) => (
          <Button
            key={j}
            className={(chapter === this.props.selectedChapter) ? 'bx-chapter-link selected': 'bx-chapter-link'}
            onClick={() => this.props.selectChapter(chapter)}
          >{ chapter.getName() }</Button>
        ))
      }
      </div>
    );
  }

  searchHandler(e) {
    this.setState({searchText: _.get(e, 'target.value', '')});
  }

  render() {
    const searchText = this.state.searchText.toLowerCase();
    return (
      <div className="bx-modulelist">
        <div className="bx-modulelist-search">
          <input
            className="bx-modulelist-search-input"
            onChange={e => this.searchHandler(e)} value={this.state.searchText}
            placeholder="__Search modules"
          />
          <div className="bx-modulelist-search-clear" onClick={e => this.searchHandler()}>x</div>
        </div>
        <div className="bx-modulelist-content">
          {
            _.chain(this.props.modules)
            .filter(m => (m.getName().toLowerCase().indexOf(searchText) !== -1))
            .map((module, i) => this.renderModule(module, i))
            .compact()
            .value()
          }
        </div>
      </div>
    );
  }
}

export default ModuleList;
