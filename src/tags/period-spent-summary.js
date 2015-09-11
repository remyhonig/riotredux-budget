import riot from 'riot';
import uuid from 'node-uuid';
import Sortable from 'sortablejs/Sortable'
import * as action from 'app/redux/action-creators';


riot.tag('period-spent-summary',
  `<li class="list-group-item" each="{section in ordering()}">
      <span riot-tag="section-title"
        store={parent.opts.store}
        id="{section.sectionId}">
      </span>
      <span class="badge" riot-tag="section-total"
        store={parent.opts.store}
        section_id="{section.sectionId}"
        period_id="{parent.opts.period_id}">
      </span>
    </li>`,

  function(opts) {
    this.ordering = () => opts.store.getState().ordering;
  }
);
