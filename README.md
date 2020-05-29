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

export default const { useStore, StoreProvider } = createStorage(StateContext, DispatchContext);
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
import { useStore, StoreProvider } from './app-store';
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
    const containerProps = useStore(selector, actionCreators, ownProps);

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

Экспортируемые методы:

<!-- TOC -->

-   [batch](#batch)
-   [createContext](#createContext)
-   [createStorage](#createStorage)
<!-- /TOC -->

Генерируемые хуки и компоненты:

<!-- TOC -->

-   [useStore](#useStore)
-   [StoreProvider](#StoreProvider)
<!-- /TOC -->

### batch

Под капотом используется unstable_batchedUpdates() API - группирует несколько обновлений в React и отрисовывает за один раз.

| Param    | Type | Description                                                            | Optional / Required |
| -------- | ---- | ---------------------------------------------------------------------- | ------------------- |
| callback | void | Callback, в котором вызываются методы, изменяющие состояние приложения | Required            |

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

### createContext

Создает "умный" `Context` который сравнивает изменения предыдущего состояния с новым при помощи `equalityFn` и если обнаружено не совпадение - отправляет изменения подписчикам

| Param      | Type     | Description                                                                                                          | Optional / Required |
| ---------- | -------- | -------------------------------------------------------------------------------------------------------------------- | ------------------- |
| initValue  | any      | Начальное состояние Context                                                                                          | Required            |
| equalityFn | Function | Функция, которая используется для сравнения предыдущего и нового состояния. по-умолчанию используется isEqualShallow | Optional            |

-   **Возвращаемое значение**: Context

### isEqualShallow

Фунция по-умолчанию для сравнения состояний контекста когда в `createContext` не указана `equalityFn`.
Вы должны понимать 2 вещи относительно этой функции:

-   она делает не глубокую проверку равенства для высокой производительности;
-   она не сравнивает свойства-функции в объектах таким образом нет необходимости использовать `React.useCallback` для проброса функций внутрь объекта для того, чтобы функция не вызывала срабатывание.

| Param    | Type | Description          | Optional / Required |
| -------- | ---- | -------------------- | ------------------- |
| newState | any  | Новое состояние      | Required            |
| oldState | any  | Предыдущее состояние | Required            |

-   **Возвращаемое значение**: boolean; true - если объекты идентичны и false - если они различны

### createStorage

Функция, которая создает хук `useStore` и компонент `StoreProvider` для, указанных при его создании, пары контестов.

| Param           | Type          | Description                      | Optional / Required |
| --------------- | ------------- | -------------------------------- | ------------------- |
| StateContext    | React.Context | Context, хранящий состояние      | Required            |
| DispatchContext | React.Context | Context, хранящий метод dispatch | Required            |

-   **Возвращаемое значение**: { useStore, StoreProvider }

### useStore

Хук, который подключает контейнер к состоянию приложения для, указанных при его создании, пары контестов.

| Param          | Type          | Description                                                                             | Optional / Required |
| -------------- | ------------- | --------------------------------------------------------------------------------------- | ------------------- |
| selector       | React.Context | функция селектор, для выборки данных из состояния                                       | Required            |
| actionCreators | React.Context | Объект из функций генераторов событий или функция, создающая объект генераторов событий | Required            |
| ownProps       | React.Context | свойства, пробрасываемые контейнеру                                                     | Required            |

-   **Возвращаемое значение**: props - результирующие свойства контейнера, полученные как объединение:
    -   собственных свойств контейнера
    -   свойств, полученных из состояния приложения
    -   свойств, полученных из генераторов событий для отправки actions в stor при помощи dispatch

### StoreProvider

Компонент-провайдер для оборачивания приложения, с целью проброса Context внутрь дерева компонентов React
