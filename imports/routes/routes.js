import {Meteor} from 'meteor/meteor';
import React from 'react';
import {Router, Route, Switch, Redirect} from 'react-router';
import createHistory from 'history/createBrowserHistory';

import BrownianSplash from '../ui/BrownianSplash'; // login
import MyList from '../ui/MyList'; // full post-login page
import NotFound from '../ui/NotFound'; // catch-all else

const browserHistory = createHistory();

const unauthenticatedPages = ['/']; // all pages users shouldn't visit if they are authenticated
const authenticatedPages = ['/myList'];

export const onAuthChange = (isAuthenticated) => {
  const pathName = browserHistory.location.pathname;
  const isUnAuthenticatedPage = unauthenticatedPages.includes(pathName);
  const isAuthenticatedPage = authenticatedPages.includes(pathName);
  if (isUnAuthenticatedPage && isAuthenticated) { // user logged in but not given content => user should move to website contentt
    browserHistory.replace('/myList');
  } else if (isAuthenticatedPage && !isAuthenticated) { // user is logged out => needs to be taken out of website content
    browserHistory.replace('/');
  }
}

export const routes = (
 <Router history={browserHistory}>
   <Switch>
     <Route exact path="/" render={() => {
       return Meteor.userId() ? <Redirect to="/myList"/> : <BrownianSplash/>
     }} />
     <Route path="/myList" render={() => {
       return !Meteor.userId() ? <Redirect to="/"/> : <MyList/>
     }} />
     <Route path="*" component={NotFound}/>
   </Switch>
 </Router>
);

