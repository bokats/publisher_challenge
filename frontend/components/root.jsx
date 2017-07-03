import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import App from './app';
import Publishers from './publishers';

const Root = () => {

  return (
    <Router history={ hashHistory }>
      <Route path='/' component={ App }>
        <IndexRoute component={ Publishers } />
      </Route>
    </Router>
  );
};

export default Root;
