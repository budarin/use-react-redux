# @budarin/use-react-redux

[English Version](https://github.com/budarin/use-react-redux/blob/master/README.en.md)

## Установка

```bash
npm install --save @budarin/use-react-redux
```

## Что это ?

Высокопроизводительная библиотека управления состоянием приложения, реализованная на React.Context и React.Hooks.

Статья с описанием реализации данной библиотеки - [React Redux на React.Hooks+React.Сontext](https://medium.com/@vadim_budarin/redux-на-react-hooks-react-сontext-ad673192309b).

## Зачем ?

Пакет react-redux представляет из себя один большой костыль: решая полезную задачу управлением состоянием приложения, он порождает проблемы, с которыми ему же и приходится бороться:

-   проблема скрещивания синхронного состояния redux, хранящегося вне react, с асинхронным циклом отрисовки React
-   проблемы [zombie children и stale props](https://medium.com/@vadim_budarin/react-понятно-о-zombie-children-and-stale-props-d31247ea08).

Размер redux + react-redux также довольно большой - около 16 кб минифицированного кода и около 8 кб - сжатого.

Поэтому требуется родное для React решение для управления глобальным состоянием приложения, которое хранит состояние в React и управляется им же.

Так же назрела необходимость иметь не только глобальное состояние приложения, но и локальные хранилища для динамически загружаемых страниц - повозившись с react-redux можно это реализовать, но наша реализация проще.

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

Ниже представлен результат профилировки добавления узла в дерево - подтверждает переисовку только модифицированного узла, а не всех узлов, как при использовании стандартного React.Context:

![](https://github.com/budarin/use-react-redux/blob/master/profile.png?raw=true)

## Как использовать

app-store.js

```jsx
import { createStorage } from '@budarin/use-react-redux';

const { useStore, StoreProvider } = createStorage();

export const useAppStore = useStore;
export const AppStoreProvider = StoreProvider;
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
import { useAppStore, AppStoreProvider } from './app-store';
import appMiddlewares from './middlewares';

const Counter = ({ props: { counter }, actions }) => (
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

const actions = {
    increment: () => ({ type: 'INCREMENT' }),
    decrement: () => ({ type: 'DECREMENT' })
};

const selector = (state) => state;
const CounterContainer = (containerProps) => {
    const props = useAppStore({ selector, actions, containerProps });

    return <Counter {...props} />;
};

export default const App = () => (
    <AppStoreProvider
        initialState={initialState}
        reducer={reducer}
        middlewares={appMiddlewares}
    >
        <CounterContainer />
    </AppStoreProvider>
);
```

Вот и все!

Размер подключаемого минифицированного кода около 4.5 кб и [~2 кб](https://bundlephobia.com/result?p=@budarin/use-react-redux) в сжатом виде.

Библиотека полностью консистентна в Concurent Mode и даже немного более производительна чем react-redux !

При разработке приложения нужно лишь уделять внимание мемоизации результатов рендера контейнера.

Приятной вам разработки! 😊

## API

Экспортируемые методы:

-   [batch](#batch)
-   [createStorage](#createStorage)

Генерируемые хуки и компоненты:

-   [useStore](#useStore)
-   [StoreProvider](#StoreProvider)

### batch

Под капотом используется unstable_batchedUpdates() API - группирует несколько обновлений в React и отрисовывает за один раз.
В контексте исполнения React - ее бесполезно использовать - React сам под капотом оптимизирует множественные последовательные изменения состояния, объединяя их в одно.
В основном данная функция должна использоваться когда состоянием управляют вне контекста React (websockets и тому подобное).

| Param    | Type | Description                                                            | Optional / Required |
| -------- | ---- | ---------------------------------------------------------------------- | ------------------- |
| callback | void | Callback, в котором вызываются методы, изменяющие состояние приложения | Required            |

Для примера выполним увеличение счетчика в 3 шага: инкремент декримент и снова инкремент счетчика.
В результате вызова всех трех изменений состояния приложения в методе `batch` - произойдет не три рендера, а один.

```javascript
import { batch } from '@budarin/use-react-redux';

window.setTimeout(
    () =>
        batch(() => {
            dispatch(actionCreators.increment());
            dispatch(actionCreators.deccrement());
            dispatch(actionCreators.increment());
        }),
    3000,
);
```

### createStorage

Функция, которая создает хук `useStore` и компонент `StoreProvider` для, указанных при его создании, пары контестов.

-   **Возвращаемое значение**: объект { useStore, StoreProvider }

#### Пример

```jsx
const { useStore, StoreProvider } = createStorage();
```

### useStore

Хук, который подключает контейнер к состоянию приложения для, указанных при его создании, пары контестов.
Входной параметр - объект:

| Param          | Type              | Description                                                                             | Optional / Required |
| -------------- | ----------------- | --------------------------------------------------------------------------------------- | ------------------- |
| selector       | Function          | функция селектор, для выборки данных из состояния                                       | Optional            |
| actions        | Function / Object | объект из функций генераторов событий или функция, создающая объект генераторов событий | Optional            |
| containerProps | any               | свойства, пробрасываемые контейнеру                                                     | Optional            |

**Возвращаемое значение**: объект
| Param | Type | Description | Optional / Required |
| -------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------- |
| props | object | результирующие свойства контейнера, полученные как объединение: собственных свойств контейнера + свойств, полученных из состояния приложения + свойств, полученных из генераторов событий для отправки actions в stor при помощи dispatch | Optional |
| actions | Object | Объект, содержащий методы, вызывающие события | Optional |
| dispatch | Dispatch | Метод dispatch хранилища данных | Required |

#### Пример

```jsx
const { props, actions, dispatch } = useStore({ selector, actions, containerProps });
```

### StoreProvider

Компонент-провайдер для оборачивания приложения, с целью проброса Context внутрь дерева компонентов React

#### Пример

```jsx
<StoreProvider reducer={reducer} initialState={initialState} middlewares={appMiddlewares}>
    <App />
</StoreProvider>
```
