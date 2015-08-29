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

    // workaround
    let update = (opts) => {
      console.info('reset');
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
      self.on('updated', () => {
        console.log('update');
        return observer.onNext('updated')
      })
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
    };

    this.on('mount', function () {

      updatedViewStream.subscribe(() => {
        console.info('hookup section sortables')
        var sections = self.root.querySelector('.sections');
        Sortable.create(sections, {
          group: 'section',
          animation: 100,
          handle: ".drag-handle",
          onEnd: evt => sectionMoved.onNext(getTree())
        });
      });

      updatedViewStream.subscribe(() => {
        console.info('hookup category sortables')
        let sections = [...self.root.querySelectorAll('.section')];
        sections.forEach(el =>
          Sortable.create(el, {
            group: 'category',
            animation: 100,
            handle: ".drag-handle",
            onEnd: evt => categoryMoved.onNext(getTree())
          })
        );
      });

      sectionMoved.subscribe(tree => {
        console.info('sectionMoved');
        opts.store.dispatch({
          type: 'ORDERING_SET',
          tree: tree
        });
        update(opts);
      });

      categoryMoved.subscribe(tree => {
        console.info('categoryMoved');
        opts.store.dispatch({
          type: 'ORDERING_SET',
          tree: tree
        });
        update(opts);
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
      update(opts);
    };

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
      update(opts);
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
  <input class="{ editing ? '' : 'invisible' }" name="input" type="text" placeholder="Amount" value="{opts.category.amount}"></input>`,

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