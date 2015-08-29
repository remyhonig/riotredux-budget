import uuid from 'node-uuid';
import { moveUpCategory } from 'app/lib/grouped-ordering';


export function ordering(state = [], action = {}) {
  switch (action.type) {

    case "ORDERING_SET":
      return action.tree;

    case "ORDERING_CATEGORY_ADD":
      return state.map(section =>
        section.sectionId == action.sectionId ?
          Object.assign({}, section, { categories: [...section.categories, action.categoryId] }) :
          section
      );

    case "ORDERING_INIT":
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

    case "SECTION_TITLE_SET":
      return state.map(section =>
          section.id === action.id ?
            Object.assign({}, section, { title: action.value }) :
            section
      );

    case "SECTION_ADD":
      return [...state, {
      id: action.id ? action.id : uuid.v4(),
      title: ""
    }];

    case "SECTION_INIT":
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

    case "CATEGORY_AMOUNT_SET":
      return state.map(category =>
          category.id === action.id ?
            Object.assign({}, category, { amount: action.value }) :
            category
      );

    case "CATEGORY_TITLE_SET":
      return state.map(category =>
          category.id === action.id ?
            Object.assign({}, category, { title: action.value }) :
            category
      );

    case "CATEGORY_ADD":
      return [...state, {
        id: action.id,
        title: "",
        amount: 0
      }];

    case 'CATEGORY_INIT':
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