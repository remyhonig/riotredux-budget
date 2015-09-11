import riot from 'riot';
import uuid from 'node-uuid';
import Sortable from 'sortablejs/Sortable'
import * as action from 'app/redux/action-creators';


riot.tag('budget-section',
  `<div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title">
        <section-title
          store={opts.store}
          id="{opts.section_id}">
        </section-title>
      </h3>
    </div>
    <div class="panel-body">
      <categories
        store="{opts.store}"
        period_id="{opts.period_id}"
        section_id="{opts.section_id}"
        ids="{categories}">
      </categories>
    </div>
  </div>`,

  function(opts) {
    let self = this;

    this.categories = opts.store.getState().ordering.find(section => section.sectionId == opts.section_id).categories;

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
      //hookupSectionSortables();
      //hookupCategorySortables();
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
      opts.store.dispatch(action.addCategory(categoryId));
      opts.store.dispatch(action.addOrderingCategory(sectionId, categoryId));
      updateView();
    }
  }
);
