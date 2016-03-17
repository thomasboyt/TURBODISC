import React from 'react';
import {Route} from 'react-router';

import App from '../views/App';

export default (
  <Route handler={App}>

    <Route
      path="/"
      component={require('../views/Attract/Handler').default} />

    <Route
      path="/playing"
      component={require('../views/Playing/Handler').default} />

  </Route>
);
