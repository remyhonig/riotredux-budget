'use strict';

// vendor
import 'babel/polyfill';
import riot from 'riot';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import Caret from 'caret-position';
import { createSelector } from 'reselect';

// application
import './riot/budget.js'
import * as reducers from './redux/stores.js';
import { logger } from './redux/middleware.js';
import * as view from './stateview.js';

const appReducers = combineReducers(reducers);
const createLoggedStore = applyMiddleware(logger)(createStore);
const appStore = createLoggedStore(appReducers);

appStore.dispatch({type: 'BUDGET_CATEGORY_INIT'});
appStore.dispatch({type: 'CATEGORY_ORDER_INIT'});
appStore.dispatch({type: 'SECTION_INIT'});
appStore.dispatch({type: 'SECTION_ORDER_INIT'});

riot.mount('budget', {
  store: appStore,
  stateView: view.budget(appStore)
});
