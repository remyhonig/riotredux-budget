'use strict';

// vendor
import 'babel/polyfill';
import riot from 'riot';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createSelector } from 'reselect';

// application
import * as reducers from 'app/redux/reducers';
import { logger } from 'app/redux/middleware';
import 'app/tags/budget';
import 'app/tags/category-amount';
import 'app/tags/category-title';
import 'app/tags/section-title';
import 'app/tags/section-total';

const appReducers = combineReducers(reducers);
const createLoggedStore = applyMiddleware(logger)(createStore);
const appStore = createLoggedStore(appReducers);

appStore.dispatch({type: 'ORDERING_INIT'});
appStore.dispatch({type: 'CATEGORY_INIT'});
appStore.dispatch({type: 'SECTION_INIT'});
appStore.dispatch({type: 'PERIOD_INIT'});
appStore.dispatch({type: 'CATEGORYBUDGET_INIT'});

riot.mount('budget', {
  store: appStore
});
