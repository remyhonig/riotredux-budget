import { assert } from 'chai';
import _ from 'underscore';

describe('ordering of objects with an id', () => {

  let moveUp = categories => id => {
    return _.chain(categories)
      .pluck('id')
      .map((currentId, index) => {
        return {
          id: currentId,
          weight: index * 2
        }
      })
      .map((item, index) => {
        if (item.id == id) {
          return Object.assign({}, item, {weight: item.weight - 3});
        }
        return item;
      })
      .sort((a, b) => a.weight > b.weight)
      .pluck('id')
      .value();
  };

  it('should be safe to call moveUp on the first item', () => {

    let categories = [
      {id: 1, section: 1}
    ];

    assert.deepEqual(moveUp(categories)(1), [1]);
  });

  it('should move an item up one place at a time', () => {

    let categories = [
      {id: 1},
      {id: 2},
      {id: 3}
    ];

    assert.deepEqual(moveUp(categories)(2), [2, 1, 3]);
    assert.deepEqual(moveUp(categories)(3), [1, 3, 2]);
  });
});