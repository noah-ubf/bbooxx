import React, { Component } from 'react';
import * as _ from 'lodash';
import {FormattedMessage} from "react-intl";

import Button from '../button/Button';

import './index.css';


const Item = props => (
  <div {...props} className={(props.className || '') + " bx-list-element"}>
    { props.children }
  </div>
)


class ModuleList extends Component {
  state = {
    searchText: '',
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.selectedModule !== this.props.selectedModule) {
      setTimeout(() => {
        const i = this.props.modules.indexOf(this.props.selectedModule);
        if (i !== -1) {
          this.refs[i].scrollIntoView({block: 'center', behavior: 'smooth'});
        }
      }, 100);
    }
  }

  renderModule(module, i) {
    if (!module) return null;
    const selected = (module === this.props.selectedModule);
    return (
      <div key={i} ref={i}>
        <Item className={selected ? 'selected': ''} onClick={() => this.props.selectModule(module)}>
          <div className="bx-module-remove">
            <FormattedMessage id="modules.remove">
            {
              titleTranslated => <Button
                action={e => this.props.removeModule(module)}
                icon="trash"
                title={titleTranslated}
                round={true}
              />
            }
            </FormattedMessage>
          </div>
          { module.getName() }
        </Item>
        {
          this.props.selectedModule === module
          ? (
            <div className="bx-booklist">
            {
              _.chain(this.props.books).map((book, i) => this.renderBook(book, i))
              .compact()
              .value()
            }
            </div>
          ) : null
        }
      </div>
    );
  }

  renderBook(book, i) {
    if (!book) return null;
    const selected = (book === this.props.selectedBook);
    return (
      <div key={i}>
        <Item className={selected ? 'selected' : null} onClick={() => this.props.selectBook(book)}>
          { book.getName() }
        </Item>
        { this.renderChapters(book) }
      </div>
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
          <Item
            key={j}
            className={(chapter === this.props.selectedChapter) ? 'bx-chapter-link selected': 'bx-chapter-link'}
            onClick={() => this.props.selectChapter(chapter)}
          >{ chapter.getName() }</Item>
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
          <FormattedMessage id="modules.search">
          {
            titleTranslated => <input
              className="bx-modulelist-search-input"
              onChange={e => this.searchHandler(e)} value={this.state.searchText}
              placeholder={titleTranslated}
            />
          }
          </FormattedMessage>
          <div className="bx-modulelist-search-clear">
            {
              this.state.searchText ? (
                <FormattedMessage id="modules.clear">
                {
                  titleTranslated => <Button
                    action={() => this.searchHandler()}
                    icon="remove"
                    title={titleTranslated}
                    round={true}
                  />
                }
                </FormattedMessage>
                ) : null
            }
          </div>
        </div>
        <div className="bx-modulelist-content">
          {
            _.chain(this.props.modules)
            .map((module, i) => {
              if (module.getName().toLowerCase().indexOf(searchText) === -1) return <div key={i} ref={i}/>;
              return this.renderModule(module, i)
            })
            .compact()
            .value()
          }
        </div>
      </div>
    );
  }
}

export default ModuleList;
