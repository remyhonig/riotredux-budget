import uuid from 'node-uuid';
import { moveUpCategory } from 'app/lib/grouped-ordering';
import * as type from './action-consts.js'

export function period(state = [], action = {}) {
  switch (action.type) {

    case type.PERIOD_INCOME_SET:
      return state.map(period =>
          period.id === action.id ?
            Object.assign({}, period, { income: action.value }) :
            period
      );

    case type.PERIOD_ADD:
      return [...state, {
        id: action.id,
        year: action.year,
        month: action.month,
        income: 0
      }];

    case type.PERIOD_INIT:
      return [
        {id: "1", year: 2015, month: 9, income: 2000}
      ];

    default:
      return state;
  }  
}

export function categorybudget(state = [], action = {}) {
  switch (action.type) {

    case type.CATEGORYBUDGET_SET:
      return state.map(categorybudget =>
          categorybudget.id === action.id ?
            Object.assign({}, categorybudget, { amount: action.amount }) :
            categorybudget
      );

    case type.CATEGORYBUDGET_ADD:
      return [...state, {
        id: action.id,
        categoryId: action.categoryId,
        periodId: action.periodId,
        amount: action.amount
      }];

    case type.CATEGORYBUDGET_INIT:
      return [
        {id: "1", periodId: "1", categoryId: "1", amount: 100},
        {id: "2", periodId: "1", categoryId: "2", amount: 200},
        {id: "3", periodId: "1", categoryId: "3", amount: 300},
        {id: "4", periodId: "1", categoryId: "4", amount: 400},
        {id: "5", periodId: "1", categoryId: "5", amount: 500},
        {id: "6", periodId: "1", categoryId: "6", amount: 600}
      ];

    default:
      return state;
  }
}

export function ordering(state = [], action = {}) {
  switch (action.type) {

    case type.ORDERING_SET:
      return action.tree;

    case type.ORDERING_SECTION_ADD:
      return [...state, { sectionId: action.id, categories: [] }];

    case type.ORDERING_CATEGORY_ADD:
      return state.map(section =>
        section.sectionId == action.sectionId ?
          Object.assign({}, section, { categories: [...section.categories, action.categoryId] }) :
          section
      );

    case type.ORDERING_INIT:
      return [
        {
          sectionId: "1",
          categories: ["1", "2", "3"]
        },
        {
          sectionId: "2",
          categories: ["4", "5", "6"]
        }
      ];

    default:
      return state;
  }
}

export function section(state = [], action = {}) {
  switch (action.type) {

    case type.SECTION_TITLE_SET:
      return state.map(section =>
          section.id === action.id ?
            Object.assign({}, section, { title: action.value }) :
            section
      );

    case type.SECTION_ADD:
      return [...state, {
      id: action.id ? action.id : uuid.v4(),
      title: ""
    }];

    case type.SECTION_INIT:
      return [
        {id: "1", title: "Een"},
        {id: "2", title: "Twee"}
      ];

    default:
      return state;
  }
}

export function category(state = [], action = {}) {
  switch (action.type) {

    case type.CATEGORY_AMOUNT_SET:
      return state.map(category =>
          category.id === action.id ?
            Object.assign({}, category, { amount: action.value }) :
            category
      );

    case type.CATEGORY_TITLE_SET:
      return state.map(category =>
          category.id === action.id ?
            Object.assign({}, category, { title: action.value }) :
            category
      );

    case type.CATEGORY_ADD:
      return [...state, {
        id: action.id,
        title: "",
        amount: 0
      }];

    case type.CATEGORY_INIT:
      return [
        {id: "1", title: "Leuke Dingen", amount: 100},
        {id: "2", title: "Vakantie", amount: 400},
        {id: "3", title: "Verzekering", amount: 120},
        {id: "4", title: "Leuke Dingen", amount: 300},
        {id: "5", title: "Vakantie", amount: 100},
        {id: "6", title: "Verzekering", amount: 121}
      ];

    default:
      return state;
  }
}