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

        <ul data-id="{section.id}" class="section">
          <li data-id="{category.id}" each="{category in section.categories}">
            <span class="drag-handle">☰</span>
            <budget-category-title store="{parent.parent.opts.store}" category="{category}"></budget-category-title>
            <budget-category-amount store="{parent.parent.opts.store}" category="{category}"></budget-category-amount>
          </li>
        </ul>
      </li>
    </ul>`,

  function(opts) {
    let self = this;
    let sortableSections = null;
    let sortableCategories = [];

    // workaround
    let reset = (opts) => {
      let savedStateView = opts.stateView;
      opts.stateView = () => [];
      self.update();
      opts.stateView = savedStateView;
      self.update();
    };

    /**
     * Any changes in the application state
     * @type {Observable}
     */
    let stateChangeStream = Rx.Observable.create(observer =>
      opts.store.subscribe(() => observer.onNext(opts.store.getState()))
    );

    /**
     * Any changes to the view state
     * @type {Observable}
     */
    let updatedViewStream = Rx.Observable.create(observer =>
      self.on('updated', observer.onNext('updated'))
    );

    let categoryStateChanged = stateChangeStream
      .pluck('category')
      .distinctUntilChanged(
        x => x.length,
        (x,y) => x < y
      )
      .startWith(null);

    let sectionStateChanged = stateChangeStream
      .pluck('section')
      .distinctUntilChanged(x => x.length, (x,y) => x < y)
      .startWith(null);

    let orderingStateChanged = stateChangeStream
      .pluck('ordering')
      .distinctUntilChanged(x => x, (x,y) => JSON.stringify(x) == JSON.stringify(y));

    let sectionMoved = new Rx.Subject();
    let categoryMoved = new Rx.Subject();

    let getTree = () => {
      let sections = [...self.root.querySelectorAll('.section')];
      return sections.map(section => {
        let categories = [...section.querySelectorAll('li')]
        return {
          sectionId: section.getAttribute('data-id'),
          categories: categories.map(el => el.getAttribute('data-id'))
        }
      });
    }

    this.on('mount', function () {

      sectionStateChanged.subscribe(() => {
        console.info('sectionStateChanged')
        reset(opts);
        var sections = self.root.querySelector('.sections');
        Sortable.create(sections, {
          group: 'section',
          animation: 100,
          handle: ".drag-handle",
          onUpdate: evt => sectionMoved.onNext(getTree())
        });
      });

      categoryStateChanged.subscribe(() => {
        console.info('categoryStateChanged')
        reset(opts);
        let sections = [...self.root.querySelectorAll('.section')];
        let sortables = sections.map(el =>
          Sortable.create(el, {
            group: 'category',
            animation: 100,
            handle: ".drag-handle",
            onAdd: evt => categoryMoved.onNext(getTree())
          })
        );
        console.info('categoryStateChanged-done')
      });

      sectionMoved.subscribe(tree => {
        console.info('sectionMoved');
        console.log(tree);
        opts.store.dispatch({
          type: 'ORDERING_SET',
          tree: tree
        });
        //reset(opts);
      });

      categoryMoved.subscribe(tree => {
        console.info('categoryMoved');
        console.log(tree);
        opts.store.dispatch({
          type: 'ORDERING_SET',
          tree: tree
        });
        //reset(opts);
      });
    });


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
      reset(opts);
    };

    this.addCategory = sectionId => () => {
      let categoryId = uuid.v4();

      opts.store.dispatch({
        type: 'CATEGORY_ADD',
        categoryId: categoryId,
        sectionId: sectionId
      });

      opts.store.dispatch({
        type: 'ORDERING_CATEGORY_ADD',
        sectionId: sectionId,
        categoryId: categoryId
      });
      //
      //opts.store.dispatch({
      //  type: 'BUDGET_SET_ORDERING',
      //  tree: getTree()
      //});
      reset(opts);
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
          type: "CATEGORY_TITLE_SET",
          categoryId: opts.category.id,
          categoryTitle: data
        });

        self.parent.update();
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
          type: "CATEGORY_AMOUNT_SET",
          category: Object.assign({}, opts.category, { amount: parseFloat(data) })
        });

        self.parent.update();
      });
    });
  }
);