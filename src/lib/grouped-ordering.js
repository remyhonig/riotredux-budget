import _ from 'underscore';


export var moveUpCategory = (categorySections, idSelector, sectionSelector) => id => {
  let weighted = _.map(categorySections, (item, index) => {
    return Object.assign({}, item, {
      weight: index * 2
    });
  });

  return _.chain(weighted)
    .map((item, index) => {
      if (idSelector(item) == id) {
        let itemToBeReplaced = _.find(weighted, replacingItem => replacingItem.weight == item.weight - 2  );
        return Object.assign({}, item, {
          weight: sectionSelector(itemToBeReplaced) == sectionSelector(item) ? item.weight - 3 : item.weight,
          section: (itemToBeReplaced !== 'undefined') ? sectionSelector(itemToBeReplaced) : sectionSelector(item)
        });
      }
      return item;
    })
    .sort((a, b) => a.weight > b.weight)
    .map(item => {
      let result = Object.assign({}, item);
      delete result.weight;
      return result;
    })
    .value();
};
