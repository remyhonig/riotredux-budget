import { categoryOrder } from '../src/stores.js';
import { assert } from 'chai';
import _ from 'underscore';

describe('ordering of budget categories', () => {

    let moveUpCategory = (categorySections) => id => {
      let weighted = _.map(categorySections, (item, index) => {
      return Object.assign({}, item, {
        weight: index * 2
      });
    });

    return _.chain(weighted)
      .map((item, index) => {
        if (item.category == id) {
          let itemToBeReplaced = _.find(weighted, replacingItem => replacingItem.weight == 0);
          return Object.assign({}, item, {
            weight: item.weight - 3,
            section: (itemToBeReplaced !== 'undefined') ? itemToBeReplaced.section : item.section
          });
        }
        return item;
      })
      .sort((a, b) => a.weight > b.weight)
      .map(item => {
        return {category: item.category, section: item.section}
      })
      .value();
  };

  it('should change the section if section is not the same', () => {

    let categorySections = [
      {category: 1, section: 3},
      {category: 2, section: 4}
    ];

    let expected = [
      {category: 2, section: 3},
      {category: 1, section: 3}
    ];

    assert.deepEqual(moveUpCategory(categorySections)(2), expected);
  });

  it('should not change the section if section is the first', () => {

    let categorySections = [
      {category: 1, section: 1}
    ];

    let expected = [
      {category: 1, section: 1}
    ];

    assert.deepEqual(moveUpCategory(categorySections)(1), expected);
  });
});