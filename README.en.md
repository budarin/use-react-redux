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
import { createContext, createStorage } from '@budarin/use-react-redux';

const StateContext = createContext();
const DispatchContext = createContext();
const storage = createStorage(StateContext, DispatchContext);

export default storage;
```

let's describe our logging middleware

middlewares.js

```javascript
const loggerMiddleware = (store) => (next) => (action) => {
    console.log('action', action);
    return next(action);
};

export default const appMiddlewares = [loggerMiddleware];
```

it remains to implement the application

app.js

```javascript
import storage from './app-store';
import appMiddlewares from './middlewares';

const { useStore, StoreProvider } = storage;

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

const selector = (state) => state;
const CounterContainer = (ownProps) => {
    const containerProps = useStore(selector, actionCreators, ownProps);

    return <Counter {...containerProps} />;
};

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

That's it!

The size of the plug-in minified code is about 3.5 KB and [1.6 KB](https://bundlephobia.com/result?p=@budarin/use-react-redux) in compressed form.

The library is completely consistent in Concurrent Mode and is even slightly more productive than react-redux!

When developing an application, you only need to pay attention to memorizing the results of the container render.

Have a nice development! 😊

## API

Exported methods:

-   [batch](#batch)
-   [createContext](#createContext)
-   [createStorage](#createStorage)
-   [createUseStore](#createUseStore)
-   [createProvider](#createProvider)

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

### createContext

Creates a "smart" `Context` that compares changes to the previous state with the new one using `equalityFn` and if no match is found, sends the changes to subscribers

| Param      | Type     | Description                                                                             | Optional / Required |
| ---------- | -------- | --------------------------------------------------------------------------------------- | ------------------- |
| initValue  | any      | the Initial state of the Context                                                        | Optional            |
| equalityFn | Function | Function that is used to compare the previous and new state. by default, isEqualShallow | Optional            | is used |

-   **Return value**: Context

#### Example

```jsx
const StateContext = createContext({ counter: 0 }, myEqualityFunction);
```

### isEqualShallow

The default function for comparing context States when `createContext` does not specify `equalityFn`.
You should understand 2 things about this function:

-   it doesn't do a deep equality check for high performance;
-   it does not compare properties-functions in objects so there is no need to use `React.useCallback` to throw functions inside the object in order for the function not to trigger.

| Param    | Type | Description    | Optional / Required |
| -------- | ---- | -------------- | ------------------- |
| newState | any  | New state      | Required            |
| oldState | any  | Previous state | Required            |

-   **Return value**: boolean; true - if the objects are identical and false - if they are different

### createStorage

Function that creates the `useStore`hook and the `StoreProvider` component for a pair of contests specified when creating It.

| Param           | Type          | Description                        | Optional / Required |
| --------------- | ------------- | ---------------------------------- | ------------------- |
| StateContext    | React.Context | Context that stores the            | Required            |
| DispatchContext | React.Context | Context, which stores the dispatch | Required            |

-   **Return value**: {useStore, StoreProvider object }

#### Example

```jsx
const { useStore, StoreProvider } = createStorage(StateContext, DispatchContext);
```

### createUseStore

Method that creates a `useStore` hook for a pair of contests specified when creating it.

| Param           | Type          | Description                        | Optional / Required |
| --------------- | ------------- | ---------------------------------- | ------------------- |
| StateContext    | React.Context | Context that stores the            | Required            |
| DispatchContext | React.Context | Context, which stores the dispatch | Required            |

-   **The return value**: hook useStore

#### Example

```jsx
const useStore = createUseStore(StateContext, DispatchContext);
```

### createProvider

Method that creates the `StoreProvider` component for a pair of contests specified when creating It.

| Param           | Type          | Description                        | Optional / Required |
| --------------- | ------------- | ---------------------------------- | ------------------- |
| StateContext    | React.Context | Context that stores the            | Required            |
| DispatchContext | React.Context | Context, which stores the dispatch | Required            |

-   **Return value**: StoreProvider component

#### Example

```jsx
const StoreProvider = createProvider(StateContext, DispatchContext);
```

### useStore

A hook that connects the container to the app state for a pair of contests specified when creating it.

| Param          | Type                                                            | Description                                                                                   | Optional / Required |
| -------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------- |
| selector       | Function / function selector, for selecting data from the state | Optional                                                                                      |
| actionCreators | Function / Object                                               | An object from event generator functions or a function that creates an event generator object | Optional            |
| ownProps       | any / properties passed to the container                        | Optional                                                                                      |

-   **Return value**: props - resulting container properties obtained as a Union:
    -   private properties of the container
    -   properties obtained from the application state
    -   properties obtained from event generators for sending actions to stor using dispatch

#### Example

```jsx
const containerProps = useStore(selector, actionCreators, ownProps);
```

### StoreProvider

Provider component for wrapping the application, in order to throw Context inside the React component tree

#### Example

```jsx
<StoreProvider reducer={reducer} initialState={initialState} middlewares={appMiddlewares}>
    <App />
</StoreProvider>
```
