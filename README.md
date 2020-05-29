# @budarin/use-react-redux

## Инсталяция

```bash
npm install --save @budarin/use-react-redux
```

## Что это ?

Высокопроизводительная библиотека управления состоянием приложения, реализованная на React.Context и React.Hooks.

Статья с описанием реализации данной библиотеки - [React Redux на React.Hooks+React.Сontext](https://medium.com/@vadim_budarin/redux-на-react-hooks-react-сontext-ad673192309b).

## Зачем ?

React-redux версии 7.x не работает корректно в Concurrent Mode React по причине того, что React-redux хранит состояние не в контексте изменений React.

Размер redux + react-redux также довольно большой - около 16кб минифицированного кода и около 8кб - сжатого .

## Как это работает ?

Библиотека использует хранение и изменение состояния исключительно в контекте React, используя React.Context и React.Hooks.

Высокая производительность ее достигается за счет использования внутри нее не документированных возможностей `React.createContext API`, которые позволяют избежать вызова рендера всех компонент, где используется доступ к React.Context, в котором произошли изменения.

Благодаря React.Hooks под капотом производится вызов рендера только тех компонент, которые были подписаны на те изменения, которые произошли в контексте.

Данный функционал контекста с подписками реализован в пакете [use-context-selection](https://www.npmjs.com/package/use-context-selection).

```javascript
const state = {
    a: 'A value',
    b: 'B value',
    c: 'B value',
};

// теперь в компоненте А можно слушать только изменени `a` в state
const a = useContextSelection((state) => state.a);
```

## Как использовать

app-store.js

```jsx
import { createContext, createStoreAccessors } from '@budarin/use-react-redux';

const StateContext = createContext();
const DispatchContext = createContext();

export default const { useAppStore, StoreProvider } = createStoreAccessors(StateContext, DispatchContext);
```

опишем наш логирующий middleware

middlewares.js

```javascript
const loggerMiddleware = (store) => (next) => (action) => {
    console.log('action', action);
    return next(action);
};

export default const appMiddlewares = [loggerMiddleware];
```

осталось реализовать приложение

app.js

```javascript
import { useAppStore, StoreProvider } from './app-store';
import appMiddlewares from './middlewares';

const Counter = ({ counter, actions }) => (
    <div>
        <p>
            Clicked: {counter} times
            {'  '}
            <button onClick={actions.increment}>+</button>
            {'  '}
            <button onClick={actions.decrement}>-</button>
        </p>
    </div>
);

const initialState = { counter: 0 };
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'INCREMENT':
            return  { counter: state.counter + 1 };
        case 'DECREMENT':
            return { counter: state.counter - 1 };
        default:
            return state;
    }
};

const actionCreators = {
    increment: () => ({ type: 'INCREMENT' }),
    decrement: () => ({ type: 'DECREMENT' })
};

const selector = state => state;
const CounterContainer = memo((ownPropsd) => {
    const containerProps = useAppStore(selector, actionCreators, ownProps);

    return useMemo(
        () => <Counter {...containerProps} />, [containerProps]
    );
});

export default const App = () => (
    <StoreProvider
        reducer={reducer}
        initialState={initialState}
        middlewares={appMiddlewares}
    >
        <CounterContainer />
    </StoreProvider>
);
```

Вот и все!

Размер подключаемого минифицированного кода около 3 кб и [1.5 кб](https://bundlephobia.com/result?p=@budarin/use-react-redux) в сжатом виде.

Библиотека полностью консистентна в Concurent Mode и даже более производительна чем react-redux ! :)

При разработке приложения нужно лишь уделять внимание мемоизации результатов рендера контейнера.

Приятной вам разработки! 😊

## API

### createContext

Creates a smart `Context` object which compares changes on your Context state and dispatches changes to subscribers.

| Param      | Type     | Description                                                                              | Optional / Required |
| ---------- | -------- | ---------------------------------------------------------------------------------------- | ------------------- |
| initValue  | any      | Initial value for the Context                                                            | Required            |
| equalityFn | Function | Function used to compare old vs new state; by default it performs shallow equality check | Optional            |

-   **Return Value**: Context

### isEqualShallow

This is the default comparator function used internally if `equalityFn` param is not provided to `createContext`.

This function is exported as part of the library in case you need it as foundations for your own equality check function.

You need to remember two things about this default equality function:

-   As the name already implies, it performs a **shallow** equality check for performance reassons;
-   It will ignore comparing `functions`; this comes handy as you'd probably include in your store functions to mutate the current state; this way there is no need to memoize the functions (e.g. using `React.useCallback`).

| Param    | Type | Description               | Optional / Required |
| -------- | ---- | ------------------------- | ------------------- |
| newState | any  | New state to compare with | Required            |
| oldState | any  | Old state to compare with | Required            |

-   **Return Value**: boolean; whether both states are considered the same or not.

### batch

Для примера выполним увеличение счетчика в 3 шага: инкремент декримент и снова инкремент счетчика.
В результате вызова всех трех изменений состояния приложения в методе `batch` - произойдет не три рендера, а один.

```javascript
import { useAppStore, StoreProvider } from './app-store';
import { batch } from '@budarin/use-react-redux';
import appMiddlewares from './middlewares';

const Counter = ({ counter, actions }) => {
    const batchedIncrement = () => {
        batch(() => {
            actions.increment();
            actions.decrement();
            actions.increment();
        });
    };

    return (
        <div>
            <p>
                Clicked: {counter} times
                {'  '}
                <button onClick={batchedIncrement}>+</button>
                {'  '}
                <button onClick={actions.decrement}>-</button>
            </p>
        </div>
    );
};
```
