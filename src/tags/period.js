import riot from 'riot';
import uuid from 'node-uuid';
import Sortable from 'sortablejs/Sortable'
import * as action from 'app/redux/action-creators';


riot.tag('period',
  `<div riot-tag="budget-section"
    store={parent.opts.store}
    period_id="{parent.opts.period_id}"
    section_id="{section.sectionId}"
    each="{section in ordering()}">
  </div>`,

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
    }

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
