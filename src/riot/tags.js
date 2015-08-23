import riot from 'riot';

riot.tag('todo-app',

  `<h3>Todos</h3>
   <todo-form store="{opts.store}"></todo-form>
   <todo-list store="{opts.store}"></todo-list>
   <p>
     Want another fully synchronized list? Just declare another list component:
     no code required, no events to wire up!
   </p>
   <todo-list store="{opts.store}"></todo-list>`,

  function(opts) {
    this.on('mount', () => opts.store.dispatch({type: 'INIT'}));
  }
);

riot.tag('todo-form',

  `<form onsubmit="{add}">
     <input name="input" type="text" placeholder="New Todo" autofocus="true">
     <input type="submit" value="Add Todo">
   </form>
   <button onclick="{clear}">Clear Completed</button>`,

  function(opts) {

    this.add = (e) => {
      if (this.input.value) {
        opts.store.dispatch({type: 'ADD', title: this.input.value, done: false});
        this.input.value = ''
      }
    };

    this.clear = (e) => {
      opts.store.dispatch({type: 'CLEAR'});
    };
  }
);


riot.tag('todo-list',

  `<ul>
     <li each="{todo in opts.store.getState()}">
       <todo-item store="{parent.opts.store}" todo="{todo}">
     </li>
   </ul>`,

  function(opts) {
    opts.store.subscribe(() => this.update());
  }
);


riot.tag('todo-item',

  `<span class="{done: opts.todo.done}" onclick="{toggle}">
     {opts.todo.title}
   </span>`,

  function(opts) {
    this.toggle = () => {
      opts.store.dispatch({type: 'TOGGLE', todo: opts.todo});
    }
  }
);
