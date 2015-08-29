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
          store="parent.opts.store"
          id="{section.id}"
          value="{section.title}">
        </section-title>

        <strong>{section.total}</strong>
        <button type="button" onclick={addCategory(section.id)}>Add</button>

        <ul data-id="{section.id}" class="section">
          <li data-id="{category.id}" each="{category in section.categories}">
            <span class="drag-handle">☰</span>

            <budget-category-title
              store="{parent.parent.opts.store}"
              id="{category.id}"
              value="{category.title}">
            </budget-category-title>

            <budget-category-amount
              store="{parent.parent.opts.store}"
              id="{category.id}"
              value="{category.amount}">
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
        categoryId: categoryId,
        section: sectionId
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
        categoryId: categoryId,
        sectionId: sectionId
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

  persist: function (value) {
    console.log('TODO: Override the this.persist(value)');
  },

  init: function () {
    let self = this;

    this.on('mount', () => {
      let value = this.opts.value;
      self.editing = value == "";
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
        self.parent.update();
        if (data == value) return;
        this.persist(data);
        self.parent.update();
      });
    })
  },

  edit: function() {
    this.editing = true;
    // rerender tag to update visibility
    this.update();
    this.root.querySelector('input').focus();
  }
};

riot.tag('section-title',
  `<input class="{editing ? '' : 'invisible'}" name="input" type="text" placeholder="Section" value="{opts.value}">
  <span class="{ editing ? 'invisible' : '' }" onclick={edit}>{opts.value}</span>`,

  function (opts) {
    this.mixin(inplaceEditableMixin);

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
  `<input class="{editing ? '' : 'invisible'}" name="input" type="text" placeholder="Category" value="{opts.value}">
  <span class="{ editing ? 'invisible' : '' }" onclick={edit}>{opts.value}</span>`,

  function (opts) {
    this.mixin(inplaceEditableMixin);

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
  <input class="{ editing ? '' : 'invisible' }" name="input" type="text" placeholder="Amount" value="{opts.value}"></input>`,

  function (opts) {
    this.mixin(inplaceEditableMixin);

    this.persist = (value) => {
      opts.store.dispatch({
        type: "CATEGORY_AMOUNT_SET",
        id: opts.id,
        value: parseFloat(value)
      });
    }

    this.on('update', () => {
      this.amount = formatMoney(opts.value);
    });
  }
);