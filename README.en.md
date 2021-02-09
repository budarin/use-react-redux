# @budarin/use-react-redux

[Russian Version](https://github.com/budarin/use-react-redux/blob/master/README.md)

## Installation

```bash
npm install --save @budarin/use-react-redux
```

## What is it ?

A high-performance application state management library implemented in React. Context and React.Hooks.

## Why ?

The react-redux package is one big crutch: when it solves a useful task of managing the state of an application, it creates problems that it also has to deal with:

-   problem of crossing a synchronous redux state stored outside of react with an asynchronous React rendering loop
-   problems zombie children and stale props

The size of redux + react-redux is also quite large - about 16 KB of minified code and about 8 KB of compressed code.

Therefore, a native React solution is required for managing the global state of the application, which stores the state in React and is managed by It.

There is also a need to have not only the global state of the application, but also local storage for dynamically loaded pages - you can implement this by tinkering with react-redux, but our implementation is simpler.

## How it works ?

The library uses state storage and modification exclusively in the React context, using React.Context and React.Hooks.

Its high performance is achieved by using the undocumented features of the `React.createContext API ' inside it, which allow you to avoid calling the render of all components that use access to React.Context, in which changes have occurred.

Thanks to React.Hooks under the hood, only those components that were subscribed to the changes that occurred in the context are called to render.

This functionality of the context with subscriptions is implemented in the package [use-context-selection](https://www.npmjs.com/package/use-context-selection).

```javascript
const state = {
    a: 'A value',
    b: 'B value',
    c: 'B value',
};

// now in component A, you can only listen to changes to `a' in state
const a = useContextSelection((state) => state.a);
```

The following is the result of profiling adding a node to the tree. It confirms that only the modified node is rendered, not all nodes, as when using the standard React.Context:

![](https://github.com/budarin/use-react-redux/blob/master/profile.png?raw=true)

## How to use it

app-store.js

```jsx
import { createStorage } from '@budarin/use-react-redux';

const { useStore, StoreProvider } = createStorage();

export const useAppStore = useStore;
export const AppStoreProvider = StoreProvider;
```

let's describe our logging middleware

middlewares.js

```javascript
const loggerMiddleware = (store) => (next) => (action) => {
    console.log('action', action);
    return next(action);
};

export const appMiddlewares = [loggerMiddleware];
```

let's describe the components of our redux store

ducks.js

```javascript
export const initialState = { counter: 0 };

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'INCREMENT':
            return { counter: state.counter + 1 };
        case 'DECREMENT':
            return { counter: state.counter - 1 };
        default:
            return state;
    }
};

export const selector = (state) => state;

export const actions = {
    increment: () => ({ type: 'INCREMENT' }),
    decrement: () => ({ type: 'DECREMENT' }),
};
```

let's describe Counter component

Counter.jsx

```javascript
export const Counter = ({ props: { counter }, actions }) => (
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
```

it remains to implement the application

app.js

```javascript
import { useAppStore, AppStoreProvider } from './app-store';

import { Counter } from './Counter';
import { appMiddlewares } from './middlewares';
import { initialState, reducer, actions, selector } from './ducks';

const CounterContainer = (containerProps) => {
    const props = useAppStore({ selector, actions, containerProps });
    return <Counter {...props} />;
};

export default const App = () => (
    <AppStoreProvider
        reducer={reducer}
        initialState={initialState}
        middlewares={appMiddlewares}
    >
        <CounterContainer />
    </AppStoreProvider>
);
```

That's it!

The size of the plug-in minified code is about 4.5 KB and [~ 2 KB](https://bundlephobia.com/result?p=@budarin/use-react-redux) in compressed form.

The library is completely consistent in Concurrent Mode and is even slightly more productive than react-redux!

When developing an application, you only need to pay attention to memorizing the results of the container render.

Have a nice development! 😊

## API

Exported methods:

-   [batch](#batch)
-   [createStorage](#createStorage)

Generated hooks and components:

-   [useStore](#useStore)
-   [StoreProvider](#StoreProvider)

### batch

Under the hood, the `unstable_batchedUpdates API` is used. it groups several updates in React and renders them at a time.
In the context of the React execution - it is useless to use it - React itself under the hood optimizes multiple successive state changes by combining them into one.
Basically, this function should be used when the state is managed outside of the React context (websockets and the like).

| Param    | Type | Description                                                   | Optional / Required |
| -------- | ---- | ------------------------------------------------------------- | ------------------- |
| callback | void | Callback that calls methods that change the application state | Required            |

For example, let's increase the counter in 3 steps: increment decriment and increment the counter again.
As a result of calling all three changes to the application state in the 'batch' method, not three renderers will occur, but one.

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

Function that creates the `useStore`hook and the `StoreProvider` to access the new storage.

-   **Return value**: {useStore, StoreProvider object }

#### Example

```jsx
const { useStore, StoreProvider } = createStorage();
```

### useStore

A hook that connects the container to the store to get data and send it actions.

Input parameter - an object:

| Param          | Type              | Description                                                                                   | Optional / Required |
| -------------- | ----------------- | --------------------------------------------------------------------------------------------- | ------------------- |
| selector       | Function          | function selector, for selecting data from the state                                          | Optional            |
| actions        | Function / Object | an object from event generator functions or a function that creates an event generator object | Optional            |
| containerProps | any               | properties passed to the container                                                            | Optional            |

-   **Return value**: object
    | Param | Type | Description | Optional / Required |
    | -------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------- |
    | props | object | resulting container properties obtained as a Union: private properties of the container + properties obtained from the application state + properties obtained from event generators for sending actions to stor using dispatch | Optional |
    | actions | Object | An object with methods to generate events | Optional |
    | dispatch | Dispatch | Dispatch store's method | Required |

#### Example

```jsx
const { props, actions, dispatch } = useStore({ selector, actions, containerProps });
```

### StoreProvider

Provider component for wrapping the application, in order to throw Context inside the React component tree

| Param          | Type         | Description                                  | Optional / Required |
| -------------- | ------------ | -------------------------------------------- | ------------------- |
| initialState   | object       | an object that stores the application state  | Optional            |
| reducer        | reducer[]    | reducer for generating the application state | Required            |
| appMiddlewares | middleware[] | array of middleware functions                | Optional            |

#### Example

```jsx
<StoreProvider reducer={reducer} initialState={initialState} middlewares={appMiddlewares}>
    <App />
</StoreProvider>
```
