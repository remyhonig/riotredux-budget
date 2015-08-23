import { formatMoney } from './money.js';

export const budget = store => () => {
  let categories = store.getState().category;
  let sections = store.getState().section;
  let sectionOrder = store.getState().sectionOrder;

  let getTotal = (sectionId, categories) => {
    let amount = categories
      .filter(c => c.section == sectionId)
      .reduce((p, c, a, b) => {
        return p + c.amount;
      }, 0);
    return formatMoney(amount)
  };

  return {
    sections: sections
      .sort((a, b) => sectionOrder.indexOf(a.id) > sectionOrder.indexOf(b.id))
      .map(section =>
        Object.assign({}, section, {
          categories: categories.filter(c => c.section == section.id),
          total: getTotal(section.id, categories)
        }))

  }
};