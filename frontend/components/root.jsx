import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import App from './app';
import Welcome from './welcome';
import Publishers from './publishers';

const Root = () => {

  return (
    <Router history={ hashHistory }>
      <Route path='/' component={ App }>
        <IndexRoute component={ Welcome } />
        <Route path="/publishers" component={ Publishers }/>
      </Route>
    </Router>
  );
};

export default Root;
