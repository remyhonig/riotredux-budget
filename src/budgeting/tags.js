import riot from 'riot';
import Rx from 'rx';
import uuid from 'node-uuid';
import { formatMoney } from 'app/lib/money';
import Sortable from 'sortablejs/Sortable'


riot.tag('budget',
  `<button type="button" onclick={addSection}>Add Section</button>
   <ul class="sections">
     <li data-id="{section.id}" each="{section in opts.stateView().sections}">
      <span class="drag-handle">☰</span>
      <input name="input" type="text" placeholder="Section" value="{section.title}">
      <strong>{section.total}</strong>
      <button type="button" onclick={addCategory(section.id)}>Add Category</button>
      <ul class="section section-{section.id}">
        <li data-id="{category.id}" store="{parent.opts.store}" each="{category in section.categories}">
          <span class="drag-handle">☰</span>
          <budget-category-title store="{opts.store}" category="{category}"></budget-category-title>
          <budget-category-amount store="{opts.store}" category="{category}"></budget-category-amount>
        </li>
      </ul>
    </li>
   </ul>`,

  function(opts) {
    let self = this;
    let sortableSections = null;
    let sortableCategories = [];

    this.on('mount', () => {
      opts.store.subscribe(() => {
        self.update()
      });

      sortableSections = Sortable.create(self.root.querySelector(".sections"), {
        group: 'sections',
        animation: 100,
        handle: ".drag-handle",
        onSort: self.onSort
      });

      sortableCategories = opts.store.getState().section.map(item =>
        Sortable.create(self.root.querySelector(".section-" + item.id), {
          group: 'categories',
          animation: 100,
          handle: ".drag-handle",
          onAdd: self.onSort
        })
      );
    });

    this.onSort = (event) => {
      console.log(event);
      console.log(sortableCategories.map(i => i.toArray()));
    };

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
    };

    this.addCategory = sectionId => () => {
      opts.store.dispatch({
        type: 'BUDGET_CATEGORY_ADD',
        section: sectionId
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


riot.tag('budget-category-title',
  `<input class="{editing ? '' : 'invisible'}" name="input" type="text" placeholder="Category" value="{opts.category.title}">
  <span class="{ editing ? 'invisible' : '' }" onclick={edit}>{opts.category.title}</span>`,

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
  `<span class="{ editing ? 'invisible' : '' }" onclick={edit}>{amount}</span>
  <input class="{ editing ? '' : 'invisible' }" name="input" type="number" placeholder="Amount" value="{opts.category.amount}"></input>`,

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