import riot from 'riot';
import uuid from 'node-uuid';
import { formatMoney } from 'app/lib/money';
import _ from 'underscore';
import * as action from 'app/redux/action-creators';
import { inplaceEditableMixin } from 'app/mixin/inplace-editing';

riot.tag('budget-category-amount',
  `<span class="{ editing ? 'invisible' : '' }" onclick={edit}>{amount}</span>
  <input class="{ editing ? '' : 'invisible' }" name="input" type="text" placeholder="Amount" value="{value}"></input>`,

  function (opts) {
    this.mixin(inplaceEditableMixin);

    this.persist = (value) => {
      let foundAmountId = amountIdFor(opts.id);
      let amountId = foundAmountId ? foundAmountId : uuid.v4();

      if (!foundAmountId) {
        opts.store.dispatch(action.addCategoryBudget(amountId, opts.period_id, opts.id, value));
      } else {
        opts.store.dispatch(action.setCategoryBudget(amountId, value));
      }
    };

    this.retrieve = () => {
      let found = opts.store.getState().categorybudget.find(c => c.id == amountIdFor(opts.id));
      return !_.isUndefined(found) ? (!_.isUndefined(found.amount) ? found.amount : '') : '';
    };

    this.on('update', () => {
      let value = this.retrieve();
      let amount = value ? value : 0;
      this.amount = formatMoney(amount);
    });

    function amountIdFor(categoryId) {
      let cb = opts.store.getState()
        .categorybudget
        .find(cb => cb.periodId == opts.period_id && cb.categoryId == categoryId)
      return cb ? cb.id : undefined;
    }
  }
);