import React, { PureComponent } from "react";
import {connect} from "react-redux";
import { IntlProvider, addLocaleData } from "react-intl";
import en from './locales/en';
import _ from "lodash";

class LangContainer extends PureComponent {
  render() {
    const {locale, children, ...last} = this.props;
    const translations = en;
    addLocaleData(translations.messages);
    const messages = {...translations.messages};

    return (
      <IntlProvider {...last} locale={locale} messages={messages}>
        <div>
          {children}
        </div>
      </IntlProvider>
    );
  }
}

function mapStateToProps(state) {
  return {locale: state.config.locale || 'en'}
}

export default connect(mapStateToProps)(LangContainer);