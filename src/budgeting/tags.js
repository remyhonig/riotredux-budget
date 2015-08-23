import riot from 'riot';
import Rx from 'rx';
import uuid from 'node-uuid';
import { formatMoney } from 'app/lib/money';

riot.tag('budget',
  `<button type="button" onclick={addSection}>Add Section</button>
   <table>
     <budget-categories each="{section in opts.stateView().sections}" store="{parent.opts.store}" section="{section}"></budget-categories>
   </table>`,

  function(opts) {
    let self = this;
    this.on('mount', () => {
      opts.store.subscribe(() => {
        self.update()
      });
    });

    this.addSection = () => {
      let sectionId = uuid.v4();
      opts.store.dispatch({
        type: 'SECTION_ADD',
        id: sectionId
      });
      opts.store.dispatch({
        type: 'BUDGET_CATEGORY_ADD',
        section: sectionId
      });
      opts.store.dispatch({
        type: 'SECTION_ORDER_ADD',
        id: sectionId
      });
    }

  }
);

var saveInputToState = (input, onChange) => {
  let event1 = Rx.Observable.fromEvent(input, 'blur');
  let event2 = Rx.Observable.fromEvent(input, 'keyup')
    .filter(key => key.keyCode === 13)

  return Rx.Observable.merge(event1, event2)
    .pluck('target', 'value')
    .forEach(onChange);
};

riot.tag('budget-categories',
  `<tr>
      <th><input name="input" type="text" placeholder="Section" value="{section.title}"></th>
      <th><strong>{section.total}</strong></th>
      <th>
        <button type="button" onclick={moveUp}>Move Up</button>
        <button type="button" onclick={moveDown}>Move Down</button>
        <button type="button" onclick={addCategory}>Add Category</button>
      </th>
    </tr>
    <tr each="{category in section.categories}">
      <td width="200px">
        <budget-category-title store="{parent.opts.store}" category="{category}"></budget-category-title>
      </td>
      <td width="100px">
        <budget-category-amount store="{parent.opts.store}" category="{category}"></budget-category-amount>
      </td>
      <td>
        <button type="button" onclick={moveCategoryUp}>Move Up</button>
        <button type="button" onclick={moveCategoryDown}>Move Down</button>
      </td>
    </tr>`,

  function (opts) {
    let self = this;

    this.moveUp = () => {
      opts.store.dispatch({
        type: 'SECTION_ORDER_UP',
        id: opts.section.id
      });
    };

    this.moveDown = () => {
      opts.store.dispatch({
        type: 'SECTION_ORDER_DOWN',
        id: opts.section.id
      });
    };

    this.moveCategoryUp = () => {
      opts.store.dispatch({
        type: 'CATEGORY_ORDER_UP',
        id: opts.category.id
      });
    };

    this.moveCategoryDown = () => {
      opts.store.dispatch({
        type: 'CATEGORY_ORDER_DOWN',
        id: opts.category.id
      });
    };

    this.addCategory = () => {
      opts.store.dispatch({
        type: 'BUDGET_CATEGORY_ADD',
        section: opts.section.id
      });
    }
  }
);


riot.tag('budget-category-title',
  `<input class="{editing ? '' : 'invisible'}" name="input" type="text" placeholder="Category" value="{opts.category.title}">
  <div class="{ editing ? 'invisible' : '' }" onclick={edit}>{opts.category.title}</div>`,

  function (opts) {
    let self = this;
    self.editing = opts.category.title == "";
    let getInput = () => this.root.querySelector('input');

    this.edit = () => {
      self.editing = true;
      // rerender tag to update visibility
      self.update();
      getInput().focus();
    };

    this.on('mount', () => {
      saveInputToState(getInput(), (data) => {
        self.editing = data == '';
        self.update();
        if (data == opts.category.title) return;
        opts.store.dispatch({
          type: "BUDGET_TITLE_SET",
          category: Object.assign({}, opts.category, {title: data})
        });
      });
    });
  }
);


riot.tag('budget-category-amount',
  `<div class="{ editing ? 'invisible' : '' }" onclick={edit}>{amount}</div>
  <input class="{ editing ? '' : 'invisible' }" name="input" type="number" placeholder="Amount" value="{opts.category.amount}">`,

  function (opts) {
    let self = this;
    self.editing = false;
    let getInput = () => this.root.querySelector('input');

    this.edit = () => {
      self.editing = true;
      // rerender tag to update visibility
      self.update();
      getInput().focus();
    };

    this.on('update', () => {
      this.amount = formatMoney(opts.category.amount);
    });

    this.on('mount', function () {
      let input = this.root.querySelector('input');
      saveInputToState(input, (data) => {
        self.editing = false;
        self.update();
        if (data == opts.category.amount) return;
        opts.store.dispatch({
          type: "BUDGET_AMOUNT_SET",
          category: Object.assign({}, opts.category, { amount: parseFloat(data) })
        });
      });
    });
  }
);