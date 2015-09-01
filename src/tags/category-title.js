import riot from 'riot';
import * as action from 'app/redux/action-creators';
import { inplaceEditableMixin } from 'app/mixin/inplace-editing';

riot.tag('budget-category-title',
  `<input class="{editing ? '' : 'invisible'}" name="input" type="text" placeholder="Category" value="{value}">
  <span class="{ editing ? 'invisible' : '' }" onclick={edit}>{value}</span>`,

  function (opts) {
    this.mixin(inplaceEditableMixin);

    this.retrieve = () => opts.store.getState().category.find(c => c.id == opts.id).title;

    this.persist = (value) => {
      opts.store.dispatch(action.setCategoryTitle(opts.id, value));
    }
  }
);
