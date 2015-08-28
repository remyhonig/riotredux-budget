import { formatMoney } from 'app/lib/money';

export const budget = store => () => {
  let categories = store.getState().category;
  let ordering = store.getState().ordering;
  let sections = store.getState().section;

  let getTotal = (categoryIds) => {
    let amount = categories
      .filter(c => categoryIds.indexOf(c.id) > -1)
      .reduce((p, c, a, b) => {
        return p + c.amount;
      }, 0);
    return formatMoney(amount)
  };

  return {
    sections: ordering
      .map(section =>
        Object.assign({}, section, {
          id: section.sectionId,
          title: sections.find(s => s.id == section.sectionId).title,
          categories: section.categories.map(categoryId => categories.find(c => c.id == categoryId)),
          total: getTotal(section.categories)
        })
      )
  }
};