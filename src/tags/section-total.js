import riot from 'riot';
import { formatMoney } from 'app/lib/money';
import _ from 'underscore';

riot.tag('section-total',

  `<span>{value}</span>`,

  function(opts) {

    console.assert(_.isString(opts.period_id));
    console.assert(_.isString(opts.section_id));

    this.on('update', () => {

      let categories = opts.store
        .getState()
        .ordering
        .find(section => section.sectionId == opts.section_id)
        .categories;

      let categorybudgets = opts.store.getState()
        .categorybudget
        .filter(c => c.periodId == opts.period_id && categories.indexOf(c.categoryId) > -1)

      this.value = formatMoney(
        categorybudgets.reduce((p, c) => p + c.amount, 0)
      )
    });
  }
);