import riot from 'riot';
import uuid from 'node-uuid';
import Sortable from 'sortablejs/Sortable'
import * as action from 'app/redux/action-creators';


riot.tag('budget',
  `<ul class="sections">
      <li data-id="{section.sectionId}" each="{section in ordering()}">
        <span class="drag-handle">☰</span>

        <section-title
          store={parent.opts.store}
          id="{section.sectionId}">
        </section-title>

        <strong>
        <section-total
          store={parent.opts.store}
          section_id="{section.sectionId}"
          period_id="{parent.opts.period_id}">
        </section-total>
        </strong>
        <button type="button" onclick={addCategory(section.sectionId)}>Add</button>

        <ul data-id="{section.sectionId}" class="section">
          <li data-id="{categoryId}" each="{categoryId in section.categories}">
            <span class="drag-handle">☰</span>

            <budget-category-title
              store={parent.parent.opts.store}
              id="{categoryId}">
            </budget-category-title>

            <budget-category-amount
              store={parent.parent.opts.store}
              id="{categoryId}"
              period_id="{parent.parent.opts.period_id}">
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
          opts.store.dispatch(action.setOrdering(createOrderingTreeFromDom()));
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
              opts.store.dispatch(action.setOrdering(createOrderingTreeFromDom()));
              updateView();
            }
          })
      );
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
      opts.store.dispatch(action.addSection(sectionId));
      opts.store.dispatch(action.addCategory(categoryId));
      opts.store.dispatch(action.addOrderingSection(sectionId));
      opts.store.dispatch(action.addOrderingCategory(sectionId, categoryId));
      updateView();
    };

    /**
     * Executed when a button is clicked
     */
    this.addCategory = sectionId => () => {
      let categoryId = uuid.v4();
      opts.store.dispatch(action.addOrderingCategory(sectionId, categoryId));
      opts.store.dispatch(action.addCategory(categoryId));
      updateView();
    }
  }
);
