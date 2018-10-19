import React, { Component } from 'react';
import {FormattedMessage} from "react-intl";
import Button from '../button/Button';


import classNames from 'classnames';

import "./index.css";


class TabBar extends Component {
  render() {
    return (
      <div className="bx-tabs-bar">
        <div className="bx-tabs-bar-actions">
          { this.props.buttonsLeft && this.props.buttonsLeft.map((b, i) => <span  key={i}>{ b }</span>) }
        </div>
        <div className="bx-tabs-bar-tabs">
          {
            this.props.tabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => tab.onSelect(tab.id)}
                className={classNames({'bx-tabs-bar-tab': true, selected: this.props.selected === tab.id})}
              >
                <div className="bx-tabs-bar-tab-name">
                  { tab.customized ? '*' : null }
                  { tab.title }
                </div>
                { tab.onRemove && <div className="bx-tabs-bar-tab-close">
                  {
                    this.props.tabs.length > 1 ? (
                      <FormattedMessage id="tabs.close">
                      {
                        titleTranslated => <Button
                            action={() => tab.onRemove(tab.id)}
                            icon="remove"
                            title={titleTranslated}
                            round={true}
                          />
                      }
                      </FormattedMessage>
                    ) : null
                  }
                </div> }
              </div>
            ))
          }
        </div>
        <div className="bx-tabs-bar-actions">
          { this.props.buttonsRight && this.props.buttonsRight.map((b, i) => <span  key={i}>{ b }</span>) }
        </div>
      </div>
    );
  }
}

export default TabBar;