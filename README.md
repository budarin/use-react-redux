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
import { createContext, createUseStore, createProvider } from '@budarin/use-react-redux';

const StateContext = createContext({});
const DispatchContext = createContext({});

export const useAppStore = createUseStore(StateContext, DispatchContext);
export const StoreProvider = createProvider(StateContext, DispatchContext);
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
import appMiddlewares from './middlewares';
import { StoreProvider, useAppStore } from './app-store';

const Counter = ({ counter, actions }) => {
    return (
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
};

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
