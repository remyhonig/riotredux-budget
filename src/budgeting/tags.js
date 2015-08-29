import riot from 'riot';
import Rx from 'rx';
import uuid from 'node-uuid';
import { formatMoney } from 'app/lib/money';
import Sortable from 'sortablejs/Sortable'


riot.tag('budget',
  `<ul class="sections">
      <li data-id="{section.id}" each="{section in opts.stateView().sections}">
        <span class="drag-handle">☰</span>

        <section-title
          store={parent.opts.store}
          id="{section.id}">
        </section-title>

        <strong>{section.total}</strong>
        <button type="button" onclick={addCategory(section.id)}>Add</button>

        <ul data-id="{section.id}" class="section">
          <li data-id="{category.id}" each="{category in section.categories}">
            <span class="drag-handle">☰</span>

            <budget-category-title
              store={parent.parent.opts.store}
              id="{category.id}">
            </budget-category-title>

            <budget-category-amount
              store={parent.parent.opts.store}
              id="{category.id}">
            </budget-category-amount>
          </li>
        </ul>
      </li>
    </ul>
    <button type="button" onclick={addSection}>Add Section</button>`,

  function(opts) {
    let self = this;

    /**
     * Traverse the DOM and return it as a tree
     * @returns {Array|*}
     */
    function createOrderingTreeFromDom() {
      let sections = [...self.root.querySelectorAll('.section')];
      return sections.map(section => {
        let categories = [...section.querySelectorAll('li')]
        return {
          sectionId: section.getAttribute('data-id'),
          categories: categories.map(el => el.getAttribute('data-id'))
        }
      });
    };

    /**
     * Setup the sections to be draggable
     */
    function hookupSectionSortables() {
      console.info('hookup section sortables')
      var sections = self.root.querySelector('.sections');
      Sortable.create(sections, {
        group: 'section',
        animation: 100,
        handle: ".drag-handle",
        onEnd: evt => {
          opts.store.dispatch({
            type: 'ORDERING_SET',
            tree: createOrderingTreeFromDom()
          });
          updateView();
        }
      });
    }

    /**
     * Setup the categories to be draggable
     */
    function hookupCategorySortables() {
      console.info('hookup category sortables')
      let sections = [...self.root.querySelectorAll('.section')];
      sections.forEach(el =>
          Sortable.create(el, {
            group: 'category',
            animation: 100,
            handle: ".drag-handle",
            onEnd: evt => {
              opts.store.dispatch({
                type: 'ORDERING_SET',
                tree: createOrderingTreeFromDom()
              });
              updateView();
            }
          })
      );
    }

    /**
     * Items that are moved in the DOM are disconnected from the riot
     * renderer. This workaround works around this issue.
     */
    function updateViewWithWorkaround() {
      console.info('updateViewWithWorkaround');
      let savedStateView = opts.stateView;

      // clean the view with this function
      opts.stateView = () => [];
      self.update();

      // use the original function to refill the view
      opts.stateView = savedStateView;
      self.update();
    }

    /**
     * Do a complete update of the view according to the state.
     */
    function updateView() {
      updateViewWithWorkaround();
      hookupSectionSortables();
      hookupCategorySortables();
    }

    this.on('mount', function () {
      hookupSectionSortables();
      hookupCategorySortables();
    });

    /**
     * Executed when a button is clicked
     */
    this.addSection = () => {
      let sectionId = uuid.v4();
      let categoryId = uuid.v4();
      opts.store.dispatch({
        type: 'SECTION_ADD',
        id: sectionId
      });
      opts.store.dispatch({
        type: 'CATEGORY_ADD',
        id: categoryId
      });
      opts.store.dispatch({
        type: 'ORDERING_CATEGORY_ADD',
        sectionId: sectionId,
        categoryId: categoryId
      });
      updateView();
    };

    /**
     * Executed when a button is clicked
     */
    this.addCategory = sectionId => () => {
      let categoryId = uuid.v4();
      opts.store.dispatch({
          type: 'ORDERING_CATEGORY_ADD',
          sectionId: sectionId,
          categoryId: categoryId
      });
      opts.store.dispatch({
        type: 'CATEGORY_ADD',
        id: categoryId
      });
      updateView();
    }
  }
);

let inplaceEditableMixin = {

  /**
   * If the tag is being edited or not.
   * This is referenced in the tag it is mixed in
   */
  editing: null,

  /**
   * The current value being edited
   */
  value: undefined,

  persist: function (value) {
    console.log('TODO: Override the this.persist(value)');
  },

  retrieve: function () {
    console.log('TODO: Override the this.retrieve()');
  },

  init: function () {
    let self = this;

    this.on('mount', () => {
      self.editing = this.retrieve() == '';
      self.value = this.retrieve();
      let input = this.root.querySelector('input')

      function saveInputToState(input, onChange) {
        let event1 = Rx.Observable.fromEvent(input, 'blur');
        let event2 = Rx.Observable.fromEvent(input, 'keyup')
          .filter(key => key.keyCode === 13)

        return Rx.Observable.merge(event1, event2)
          .pluck('target', 'value')
          .forEach(onChange);
      }

      saveInputToState(input, (data) => {
        self.editing = data == '';
        if (data == self.value) {
          self.update();
          return;
        }
        this.persist(data);
        self.value = self.retrieve()
        self.parent.update();
      });
    })

    this.on('update', () => {
      self.value = self.retrieve();
    })
  },

  edit: function() {
    this.editing = true;
    // rerender tag to update visibility
    this.update();
    let input = this.root.querySelector('input');
    input.focus();
    input.setSelectionRange(0, String(this.value).length);
  }
};

riot.tag('section-title',
  `<input class="{editing ? '' : 'invisible'}" name="input" type="text" placeholder="Section" value="{value}">
  <span class="{ editing ? 'invisible' : '' }" onclick={edit}>{value}</span>`,

  function (opts) {
    this.mixin(inplaceEditableMixin);

    this.retrieve = () => opts.store.getState().section.find(c => c.id == opts.id).title;

    this.persist = (value) => {
      opts.store.dispatch({
        type: "SECTION_TITLE_SET",
        id: opts.id,
        value: value
      });
    }
  }
);

riot.tag('budget-category-title',
  `<input class="{editing ? '' : 'invisible'}" name="input" type="text" placeholder="Category" value="{value}">
  <span class="{ editing ? 'invisible' : '' }" onclick={edit}>{value}</span>`,

  function (opts) {
    this.mixin(inplaceEditableMixin);

    this.retrieve = () => opts.store.getState().category.find(c => c.id == opts.id).title;

    this.persist = (value) => {
      opts.store.dispatch({
        type: "CATEGORY_TITLE_SET",
        id: opts.id,
        value: value
      });
    }
  }
);

riot.tag('budget-category-amount',
  `<span class="{ editing ? 'invisible' : '' }" onclick={edit}>{amount}</span>
  <input class="{ editing ? '' : 'invisible' }" name="input" type="text" placeholder="Amount" value="{value}"></input>`,

  function (opts) {
    this.mixin(inplaceEditableMixin);

    this.persist = (value) => {
      opts.store.dispatch({
        type: "CATEGORY_AMOUNT_SET",
        id: opts.id,
        value: parseFloat(value)
      });
    }

    this.retrieve = () => opts.store.getState().category.find(c => c.id == opts.id).amount;

    this.on('update', () => {
      this.amount = formatMoney(this.retrieve(opts.id));
    });
  }
);