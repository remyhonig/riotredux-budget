import riot from 'riot';
import uuid from 'node-uuid';
import Sortable from 'sortablejs/Sortable'
import * as action from 'app/redux/action-creators';
import { formatMoney } from 'app/lib/money';

riot.tag('income-timeline',
  `<a href="#" class="list-group-item { active : isActive(income.id) }" onclick={select(income.id)} each="{income in incomes}">
      {income.year}-{income.month}-{income.day}
      <span class="badge">{remaining(income)}</span>
    </a>`,

  function(opts) {

    let pastPeriods = (period) =>
      opts.store.getState().period
        .filter((p) => p.day * p.month * p.year <= period.day * period.month * period.year);

    let pastPeriodIds = (period) => pastPeriods(period).map((p) => p.id);
    let pastPeriodTotalIncome = (period) => pastPeriods(period).reduce((prev, next) => prev + next.amount, 0);

    let totalPlanned = (income) =>
      opts.store.getState()
        .categorybudget
        .filter((amount) => pastPeriodIds(income).indexOf(amount.periodId) > -1)
        .reduce((prev, next) => prev + next.amount, 0);

    this.remaining = (income) => formatMoney(pastPeriodTotalIncome(income) - totalPlanned(income));

    this.incomes = opts.store.getState().period;

    this.select = (value) => () => {
      opts.store.dispatch(action.selectPeriod(value));
    };

    this.isActive = (id) => id == opts.store.getState().selectedPeriod;
  }
);
