import { combineReducers } from "redux";

const counterInitialState = {
  counter: 0,
};

// Счетчик 1

export const actionCreators1 = {
  increment: () => ({ type: "COUNTER1:INCREMENT" }),
  decrement: () => ({ type: "COUNTER1:DECREMENT" }),
};
export const selector1 = (state) => state.Counter1;

const reducer1 = (state = counterInitialState, action) => {
  switch (action.type) {
    case "COUNTER1:INCREMENT":
      return {
        counter: state.counter + 1,
      };
    case "COUNTER1:DECREMENT":
      return {
        counter: state.counter - 1,
      };
    default:
      return state;
  }
};

// Счетчик 2

export const actionCreators2 = {
  increment: () => ({ type: "COUNTER2:INCREMENT" }),
  decrement: () => ({ type: "COUNTER2:DECREMENT" }),
};
export const selector2 = (state) => state.Counter2;

const reducer2 = (state = counterInitialState, action) => {
  switch (action.type) {
    case "COUNTER2:INCREMENT":
      return {
        counter: state.counter + 1,
      };
    case "COUNTER2:DECREMENT":
      return {
        counter: state.counter - 1,
      };
    default:
      return state;
  }
};

// initialState & reducer

export const initialState = {
  Counter1: counterInitialState,
  Counter2: counterInitialState,
};

export const reducer = combineReducers({
  Counter1: reducer1,
  Counter2: reducer2,
});
