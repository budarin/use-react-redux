import React, { useMemo } from "react";

import storage from "./utils/storage";
import appMiddlewares from "./utils/middlewares";
import { createCounter } from "./utils/createCounter";
import {
  initialState,
  reducer,
  selector1,
  selector2,
  actionCreators1,
  actionCreators2,
} from "./utils/duck";

const { useStore, StoreProvider } = storage;
const Counter1 = createCounter(1);
const Counter2 = createCounter(2);

const CounterContainer1 = () => {
  const containerProps = useStore(selector1, actionCreators1);
  return useMemo(() => <Counter1 {...containerProps} />, [containerProps]);
};

const CounterContainer2 = () => {
  const containerProps = useStore(selector2, actionCreators2);
  return useMemo(() => <Counter2 {...containerProps} />, [containerProps]);
};

const App = () => (
  <StoreProvider
    reducer={reducer}
    initialState={initialState}
    middlewares={appMiddlewares}
  >
    <CounterContainer1 />
    <CounterContainer2 />
  </StoreProvider>
);

export default App;
