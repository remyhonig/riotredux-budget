'use strict';

// vendor
import 'babel/polyfill';
import riot from 'riot';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createSelector } from 'reselect';
import * as action from './redux/action-consts.js';

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

appStore.dispatch({ type: action.ORDERING_INIT });
appStore.dispatch({ type: action.CATEGORY_INIT });
appStore.dispatch({ type: action.SECTION_INIT });
appStore.dispatch({ type: action.PERIOD_INIT });
appStore.dispatch({ type: action.CATEGORYBUDGET_INIT });

riot.mount('budget', {
  store: appStore
});
