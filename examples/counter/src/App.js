import appMiddlewares from './utils/middlewares';
import { useAppStore, AppStoreProvider } from './utils/storage';
import { initialState, reducer, selector, actionCreators } from './utils/duck';

const Counter = (counterProps) => {
    const { props, actions } = counterProps;

    return (
        <div>
            <p>
                Счетчик: {props.counter}
                <br />
                <button onClick={actions.increment}>Увеличить</button>{' '}
                <button onClick={actions.decrement}>Уменьшить</button>
            </p>
        </div>
    );
};

const CounterContainer = () => {
    const props = useAppStore({
        selector,
        actions: actionCreators,
    });

    return <Counter {...props} />;
};

const App = () => (
    <AppStoreProvider initialState={initialState} reducer={reducer} middlewares={appMiddlewares}>
        <CounterContainer />
    </AppStoreProvider>
);

export default App;
