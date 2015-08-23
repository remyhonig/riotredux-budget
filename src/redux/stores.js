import uuid from 'node-uuid';

const swap = (state, id, isUpMove) => {
  let oldPos = null;
  let newPos = null;

  oldPos = state.indexOf(id);
  if (isUpMove) {
    newPos = Math.max(0, oldPos - 1);
  } else {
    newPos = Math.min(state.length - 1, oldPos + 1);
  }

  return state.map(item => {
    let itemPos = state.indexOf(item);
    if (itemPos == newPos) {
      return state[oldPos];
    }
    if (itemPos == oldPos) {
      return state[newPos];
    }
    return item;
  });
};

export function categoryOrder(state = [], action = {}) {

  switch (action.type) {

    case "CATEGORY_ORDER_UP":
      return swap(state, action.id, true);

    case "CATEGORY_ORDER_DOWN":
      return swap(state, action.id, false);

    case "CATEGORY_ORDER_ADD":
      return [action.id, ...state];

    case "CATEGORY_ORDER_INIT":
      return [1, 2, 3, 4, 5, 6];

    default:
      return state;
  }
}

export function sectionOrder(state = [], action = {}) {

  switch (action.type) {

    case "SECTION_ORDER_UP":
      return swap(state, action.id, true);

    case "SECTION_ORDER_DOWN":
      return swap(state, action.id, false);

    case "SECTION_ORDER_ADD":
      return [action.id, ...state];

    case "SECTION_ORDER_INIT":
      return [1, 2];

    default:
      return state;
  }
}

export function section(state = [], action = {}) {
  switch (action.type) {

    case "SECTION_TITLE_SET":
      return state.map(section =>
          section .id === action.section.id ?
            Object.assign({}, section, { title: action.section.title }) :
            section
      );

    case "SECTION_ADD":
      return [...state, {
      id: action.id ? action.id : uuid.v4(),
      title: ""
    }];

    case "SECTION_INIT":
      return [
        {id: 1, title: "Een"},
        {id: 2, title: "Twee"}
      ];

    default:
      return state;
  }
}

export function category(state = [], action = {}) {
  switch (action.type) {

    case "BUDGET_AMOUNT_SET":
      return state.map(category =>
          category.id === action.category.id ?
            Object.assign({}, category, { amount: action.category.amount }) :
            category
      );

    case "BUDGET_TITLE_SET":
      return state.map(category =>
          category.id === action.category.id ?
            Object.assign({}, category, { title: action.category.title }) :
            category
      );

    case "BUDGET_CATEGORY_ADD":
      return [...state, {
        id: state.reduce((maxId, item) => Math.max(item.id, maxId), -1) + 1,
        section: action.section,
        title: "",
        amount: 0
      }];

    case 'BUDGET_CATEGORY_INIT':
      return [
        {id: 1, section: 1, title: "Leuke Dingen", amount: 100},
        {id: 2, section: 1, title: "Vakantie", amount: 400},
        {id: 3, section: 1, title: "Verzekering", amount: 120},
        {id: 4, section: 2, title: "Leuke Dingen", amount: 300},
        {id: 5, section: 2, title: "Vakantie", amount: 100},
        {id: 6, section: 2, title: "Verzekering", amount: 121}
      ];

    default:
      return state;
  }
}