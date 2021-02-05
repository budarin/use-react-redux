import { useAppStore, AppStoreProvider } from './utils/storage';
import appMiddlewares from './utils/middlewares';
import { createCounter } from './utils/createCounter';
import { initialState, reducer, selector1, selector2, actionCreators1, actionCreators2 } from './utils/duck';

const Counter1 = createCounter(1);
const Counter2 = createCounter(2);

const CounterContainer1 = () => {
    const containerProps = useAppStore({
        selector: selector1,
        actions: actionCreators1,
    });

    return <Counter1 {...containerProps} />;
};

const CounterContainer2 = () => {
    const containerProps = useAppStore({
        selector: selector2,
        actions: actionCreators2,
    });

    return <Counter2 {...containerProps} />;
};

const App = () => (
    <AppStoreProvider reducer={reducer} initialState={initialState} middlewares={appMiddlewares}>
        <CounterContainer1 />
        <CounterContainer2 />
    </AppStoreProvider>
);

export default App;
