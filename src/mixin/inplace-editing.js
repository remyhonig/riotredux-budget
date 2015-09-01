import riot from 'riot';
import Rx from 'rx';


export var inplaceEditableMixin = {

  editing: false,

  /**
   * If the tag is being edited or not.
   * This is referenced in the tag it is mixed in
   */
  persist: function(value) {
    console.log('TODO: Override the this.persist(value)');
  },

  retrieve: function () {
    console.log('TODO: Override the this.retrieve()');
  },

  init: function () {
    let self = this;

    this.on('mount', () => {
      self.editing = this.retrieve() == '';
      self.value = this.retrieve();
      let input = this.root.querySelector('input')

      function saveInputToState(input, onChange) {
        let blurEvents = Rx.Observable.fromEvent(input, 'blur');
        let enterPressed = Rx.Observable.fromEvent(input, 'keyup')
          .filter(key => key.keyCode === 13)
        return Rx.Observable.merge(blurEvents, enterPressed)
          .pluck('target', 'value')
          .forEach(onChange);
      }

      saveInputToState(input, (data) => {
        self.editing = data == '';
        if (data == self.value) {
          self.update();
          return;
        }
        this.persist(data);
        self.value = self.retrieve()
        self.parent.update();
      });
    })

    this.on('update', () => {
      self.value = self.retrieve();
    })
  },

  edit: function() {
    this.editing = true;
    // rerender tag to update visibility
    this.update();
    let input = this.root.querySelector('input');
    input.focus();

    input.setSelectionRange(0, String(this.value).length);
  }
};
