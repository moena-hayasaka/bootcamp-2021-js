/**
 * Dispatcher
 */
class Dispatcher extends EventTarget {
  dispatch() {
    this.dispatchEvent(new CustomEvent("event"));
  }

  subscribe(subscriber) {
    this.addEventListener("event", subscriber);
  }
}

/**
 * Action Creator and Action Types
 */
const FETCH_TODO_ACTION_TYPE = "Fetch todo list from server";
export const createFetchTodoListAction = () => ({
  type: FETCH_TODO_ACTION_TYPE,
  paylaod: undefined
});

const ADD_TODO_ACTION_TYPE = "A todo addition to store";
export const createAddTodoAction = todo => ({
  type: ADD_TODO_ACTION_TYPE,
  payload: todo
});

const CLEAR_ERROR = "Clear error from state";
export const clearError = () => ({
  type: CLEAR_ERROR,
  payload: undefined
});

/**
 * Store Creator
 */
const api = "http://localhost:3000/todo";

const defaultState = {
  todoList: [],
  error: null
};

const headers = {
  "Content-Type": "application/json; charset=utf-8"
};

export function createStore(initialState = defaultState) {
  const dispatcher = new Dispatcher();
  let state = initialState;

  const dispatch = async ({ type, payload }) => {
    console.log(type, payload);
    switch (type) {
      case FETCH_TODO_ACTION_TYPE: {
        try {
          const resp = await fetch(api).then(d => d.json());
          state = { todoList: resp.todoList, error: null };
        } catch (err) {
          state.error = err;
        } finally {
          dispatcher.dispatch();
        }
        break;
      }
      case ADD_TODO_ACTION_TYPE: {
        const body = JSON.stringify(payload);
        const config = { method: "POST", body, headers };
        try {
          const resp = await fetch(api, config).then(d => d.json());
          state = { todoList: [...state.todoList, resp], error: null };
        } catch (err) {
          state.error = err;
        } finally {
          dispatcher.dispatch();
        }
        break;
      }
      case CLEAR_ERROR: {
        state.error = null;
        dispatcher.dispatch();
      }
      default: {
        throw new Error("unexpected action type: %o", { type, payload });
      }
    }
  };

  const subscribe = subscriber => {
    dispatcher.subscribe(() => subscriber(state));
  };

  return {
    dispatch,
    subscribe
  };
}
