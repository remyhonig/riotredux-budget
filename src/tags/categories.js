import riot from 'riot';
import uuid from 'node-uuid';
import Sortable from 'sortablejs/Sortable'
import * as action from 'app/redux/action-creators';
import { formatMoney } from 'app/lib/money';


riot.tag('categories',
  `<table class="table">
      <thead>
        <tr>
          <th></th>
          <th>Planned</th>
          <th>Spent</th>
          <th>Remaining</th>
        </tr>
      </thead>
      <tbody>
        <tr data-id="{category}" each="{categoryId in opts.ids}">
          <th scope="row">
            <span class="drag-handle">☰</span>
            <span riot-tag="budget-category-title"
              store={parent.opts.store}
              id="{categoryId}">
            </span>
          </th>
          <td riot-tag="budget-category-amount"
              store={parent.opts.store}
              id="{categoryId}"
              period_id="{parent.opts.period_id}">
          </td>
          <td>€ 7,99</td>
          <td>{remaining(parent.opts.period_id, categoryId)}</td>
        </tr>
      </tbody>
  </table>`,

  function(opts) {
    let self = this;

    function getPeriodById(id) {
      return opts.store.getState().period.find((p) => p.id == id);
    }

    function getCategoryBudgetById(periodId, categoryId) {
      return opts.store.getState().categorybudget.find((p) => p.categoryId == categoryId && p.periodId == periodId);
    }

    let pastPeriods = (period) =>
      opts.store.getState().period
        .filter((p) => p.day * p.month * p.year <= period.day * period.month * period.year);

    let pastPeriodIds = (period) => pastPeriods(period).map((p) => p.id);

    this.remaining = (periodId, categoryId) =>
      formatMoney(
        opts.store.getState()
          .categorybudget
          .filter(
            (b) => b.categoryId == categoryId &&
              pastPeriodIds(getPeriodById(periodId)).indexOf(b.periodId) > -1
          )
          .reduce((prev, next) => prev + next.amount, 0)
      );

    /**
     * Traverse the DOM and return it as a tree
     * @returns {Array|*}
     */
    function getCategoryIds() {
      let rows = [...self.root.querySelectorAll('tbody tr')];
      return rows.map(row => row.getAttribute('data-id'));
    }

    /**
     * Setup the categories to be draggable
     */
    function hookupCategorySortables() {
      let rows = self.root.querySelector('tbody');
      Sortable.create(rows, {
        group: 'category-' + opts.section_id,
        animation: 100,
        draggable: 'tr',
        handle: "span.drag-handle",
        onEnd: evt => {
          opts.store.dispatch(action.setOrderingSectionCategories(opts.section_id, getCategoryIds()));
          updateView();
        }
      })
    }

    self.ordering = () => opts.store.getState().ordering;

    /**
     * Items that are moved in the DOM are disconnected from the riot
     * renderer. This workaround works around this issue.
     */
    function updateViewWithWorkaround() {
      console.info('updateViewWithWorkaround');
      let ordering = self.ordering;

      // clean the view with this function
      self.ordering = () => [];
      self.update();

      // use the original function to refill the view
      self.ordering = ordering;
      self.update();
    }

    /**
     * Do a complete update of the view according to the state.
     */
    function updateView() {
      updateViewWithWorkaround();
      hookupCategorySortables();
    }

    this.on('mount', function () {
      hookupCategorySortables();
    });

    /**
     * Executed when a button is clicked
     */
    this.addCategory = sectionId => () => {
      let categoryId = uuid.v4();
      opts.store.dispatch(action.addCategory(categoryId));
      opts.store.dispatch(action.addOrderingCategory(sectionId, categoryId));
      updateView();
    }
  }
);
