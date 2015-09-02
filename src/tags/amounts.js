import riot from 'riot';
import uuid from 'node-uuid';
import * as action from 'app/redux/action-creators';


riot.tag('amounts',
  `<ul class="sections">
      <li data-id="{section.sectionId}" each="{section in ordering()}">

        <strong>
        <section-total
          store={parent.opts.store}
          section_id="{section.sectionId}"
          period_id="{parent.opts.period_id}">
        </section-total>
        </strong>

        <ul data-id="{section.sectionId}" class="section">
          <li data-id="{categoryId}" each="{categoryId in section.categories}">

            <budget-category-amount
              store={parent.parent.opts.store}
              id="{categoryId}"
              period_id="{parent.parent.opts.period_id}">
            </budget-category-amount>
          </li>
        </ul>
      </li>
    </ul>`,

  function(opts) {
    let self = this;

    self.ordering = () => opts.store.getState().ordering;

    /**
     * Items that are moved in the DOM are disconnected from the riot
     * renderer. This workaround works around this issue.
     */
    function updateView() {
      console.info('updateViewWithWorkaround');
      let ordering = self.ordering;

      // clean the view with this function
      self.ordering = () => [];
      self.update();

      // use the original function to refill the view
      self.ordering = ordering;
      self.update();
    }

    this.on('mount', function () {
    });
  }
);
