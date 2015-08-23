'use strict';

// vendor
import 'babel/polyfill';
import riot from 'riot';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createSelector } from 'reselect';

// application
import 'app/budgeting/tags'
import * as reducers from 'app/redux/reducers';
import { logger } from 'app/redux/middleware';
import * as view from 'app/budgeting/store-view';

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
