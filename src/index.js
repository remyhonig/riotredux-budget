'use strict';

// vendor
import 'babel/polyfill';
import riot from 'riot';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createSelector } from 'reselect';
import * as action from './redux/action-consts.js';
import 'font-awesome-webpack';

// application
import * as reducers from './redux/reducers.js';
import { logger } from './redux/middleware.js';
import './tags/main.js';
import './tags/section.js';
import './tags/categories.js';
import './tags/period.js';
import './tags/period-spent-summary.js';
import './tags/income-timeline.js';

import './tags/tree.js';
import './tags/budget.js';
import './tags/amounts.js';
import './tags/category-amount.js';
import './tags/category-title.js';
import './tags/section-title.js';
import './tags/section-total.js';
import './tags/section-total.js';

const appReducers = combineReducers(reducers);
const createLoggedStore = applyMiddleware(logger)(createStore);
const appStore = createLoggedStore(appReducers);

appStore.dispatch({ type: action.ORDERING_INIT });
appStore.dispatch({ type: action.CATEGORY_INIT });
appStore.dispatch({ type: action.SECTION_INIT });
appStore.dispatch({ type: action.PERIOD_INIT });
appStore.dispatch({ type: action.CATEGORYBUDGET_INIT });

riot.mount('main', {
  store: appStore
});
