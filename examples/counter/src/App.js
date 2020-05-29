import React, { useMemo } from "react";
import appMiddlewares from "./utils/middlewares";
import storage from "./utils/storage";
import { initialState, reducer, selector, actionCreators } from "./utils/duck";

const { useStore, StoreProvider } = storage;

const Counter = ({ counter, actions }) => {
  return (
    <div>
      <p>
        Счетчик: {counter}
        <br />
        <button onClick={actions.increment}>Увеличить</button>{" "}
        <button onClick={actions.decrement}>Уменьшить</button>
      </p>
    </div>
  );
};

const CounterContainer = () => {
  const containerProps = useStore(selector, actionCreators);
  return useMemo(() => <Counter {...containerProps} />, [containerProps]);
};

const App = () => (
  <StoreProvider
    reducer={reducer}
    initialState={initialState}
    middlewares={appMiddlewares}
  >
    <CounterContainer />
  </StoreProvider>
);

export default App;
