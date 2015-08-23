import Caret from 'caret-position';

export const logger = store => next => action => {
  console.log('dispatch', action);
  let result = next(action);
  console.log('next state', store.getState());
  return result;
};

export const statePersister = store => next => action => {
  console.log('persist state after', action.type);
  let result = next(action);
  window.localStorage.setItem('riot-todo', JSON.stringify(store.getState()));
  return result;
};

export const caretPositionRestore = store => next => action => {
  let isInput = document.activeElement.tagName === 'INPUT';
  let pos = null;
  if (isInput) {
    pos = Caret.get(document.activeElement);
  }
  let result = next(action);
  if (isInput) {
    console.log('restore caret position of active element');
    Caret.set(document.activeElement, pos.caret, pos.caret);
  }
  return result;
};