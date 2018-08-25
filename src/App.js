import React, { Component } from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import rootReducer from './reducers/file';
// import { AppMenu } from './src/components';
import AppMenu from './components/app_menu/AppMenu';
import Display from './components/display/Display';

import './App.css';

const store = createStore(rootReducer, applyMiddleware(thunk));


class App extends Component {

  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <AppMenu className="bx-menu" />
          <Display className="bx-content"/>
        </div>
      </Provider>
    );
  }
}

export default App;
