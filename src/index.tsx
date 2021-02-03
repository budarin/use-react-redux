import ReactDOM from 'react-dom';
import { useContextSelection } from 'use-context-selection';
import { memo, useMemo, useContext, useRef, useLayoutEffect, useEffect, useReducer } from 'react';

import type { Context, ClassAttributes } from 'react';

import getDispatchedProps from './utils/getDispatchedProps';
import { setBatch, getBatch } from './utils/batch';
import compose from './utils/compose';

export { createContext } from 'use-context-selection';
export const batch = getBatch();

const emptyObject = {};
const emptyMiddlewaresArray: Array<Middleware> = [];
const emptySelector = (x: any, _: React.ClassAttributes<any>) => x;
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

setBatch(ReactDOM.unstable_batchedUpdates);

const createStore = (reducer: Reducer<any>, initState = emptyObject, middlewares = emptyMiddlewaresArray) => {
    const [state, dispatch] = useReducer(reducer, initState);
    const currentState = useRef(state);

    useIsomorphicLayoutEffect(() => {
        currentState.current = state;

        return () => {
            currentState.current = undefined;
        };
    });

    const store = useMemo(() => {
        function enhancedDispatchFunc() {
            const chain = middlewares.map((middleware) => middleware(store));

            return compose(...chain)(dispatch);
        }

        return {
            getState: () => currentState.current,
            dispatch: (action: Action) => {
                const enhancedDispatch: Dispatch = enhancedDispatchFunc();

                return enhancedDispatch(action);
            },
        };
    }, [middlewares]);

    return { state, dispatch: store.dispatch };
};

export const createProvider = (StateContext: Context<any>, DispatchContext: Context<Dispatch>) => {
    function StoreProvider({ reducer, initialState = emptyObject, middlewares, children }: IStoreProvider) {
        const { state, dispatch } = createStore(reducer, initialState, middlewares);

        return (
            <DispatchContext.Provider value={dispatch}>
                <StateContext.Provider value={state}>{children}</StateContext.Provider>
            </DispatchContext.Provider>
        );
    }

    return memo(StoreProvider);
};

export const createUseStore = (StateContext: Context<any>, DispatchContext: Context<Dispatch>) => (
    selector = emptySelector,
    actions: IHash<(...args: any[]) => Dispatch> = emptyObject,
    containerProps: ClassAttributes<any> = emptyObject,
) => {
    const dispatch = useContext<Dispatch>(DispatchContext);
    const dispatchProps = useMemo(getDispatchedProps(actions, dispatch, containerProps), [dispatch, actions]);
    const stateProps = useContextSelection(StateContext, (state: any) => selector(state, containerProps));

    return useMemo<ClassAttributes<any>>(
        () => ({
            ...containerProps,
            ...stateProps,
            actions: dispatchProps,
            dispatch,
        }),
        [containerProps, stateProps, dispatchProps],
    );
};

export const createStorage = (StateContext: Context<any>, DispatchContext: Context<Dispatch>) => ({
    useStore: createUseStore(StateContext, DispatchContext),
    StoreProvider: createProvider(StateContext, DispatchContext),
});
