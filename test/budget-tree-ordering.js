import { assert } from 'chai';
import _ from 'underscore';
import { moveUpCategory } from 'app/lib/grouped-ordering';


describe('ordering of budget categories', () => {

  it('should change the section if section is not the same', () => {

    let tree = [
      {
        section:
        {
          id: 3,
          categories: [
            {id: 2},
            {id: 1}
          ]
        }
      },
      {
        section: {
          id: 1,
          categories: [
            {id: 2}
          ]
        }
      }
    ];

    let expected = [
      {category: 1, section: 3},
      {category: 2, section: 3}
    ];

    assert.deepEqual(
      moveUpCategory(
        categorySections,
          item => item.category,
          item => item.section)(2),
      expected
    );
  });

  it('should not change the section if section is the first', () => {

    let categorySections = [
      {category: 1, section: 1}
    ];

    let expected = [
      {category: 1, section: 1}
    ];

    assert.deepEqual(
      moveUpCategory(
        categorySections,
          item => item.category,
          item => item.section)(1),
      expected
    );
  });

  it('should not change the section if section is same', () => {

    let categorySections = [
      {category: 1, section: 1},
      {category: 2, section: 2},
      {category: 3, section: 2}
    ];

    let expected = [
      {category: 1, section: 1},
      {category: 3, section: 2},
      {category: 2, section: 2}
    ];

    assert.deepEqual(
      moveUpCategory(
        categorySections,
          item => item.category,
          item => item.section)(3),
      expected
    );
  });

  it('should not change the position if section changed', () => {

    let categorySections = [
      {category: 1, section: 1},
      {category: 2, section: 1},
      {category: 3, section: 2}
    ];

    let expected = [
      {category: 1, section: 1},
      {category: 2, section: 1},
      {category: 3, section: 1}
    ];

    assert.deepEqual(
      moveUpCategory(
        categorySections,
          item => item.category,
          item => item.section)(3),
      expected
    );
  });
});