import appMiddlewares from './utils/middlewares';
import { useAppStore, AppStoreProvider } from './utils/storage';
import { initialState, reducer, selector, actionCreators } from './utils/duck';

const Counter = ({ counter, actions }) => {
    return (
        <div>
            <p>
                Счетчик: {counter}
                <br />
                <button onClick={actions.increment}>Увеличить</button>{' '}
                <button onClick={actions.decrement}>Уменьшить</button>
            </p>
        </div>
    );
};

const CounterContainer = () => {
    const containerProps = useAppStore(selector, actionCreators);

    return <Counter {...containerProps} />;
};

const App = () => (
    <AppStoreProvider initialState={initialState} reducer={reducer} middlewares={appMiddlewares}>
        <CounterContainer />
    </AppStoreProvider>
);

export default App;
