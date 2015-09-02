import riot from 'riot';
import uuid from 'node-uuid';
import * as action from 'app/redux/action-creators';


riot.tag('budget',
  `<tree store={opts.store} period_id="1"></tree>
   <amounts store={opts.store} period_id="1"></amounts>
   <amounts store={opts.store} period_id="2"></amounts>
   `,

  function(opts) {

    // when ordering changes the amounts should update as well to reflect the new ordering
    opts.store.subscribe(() => this.update());
  }
);
