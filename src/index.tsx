import React, { memo, useMemo, useContext, useLayoutEffect, useEffect, useRef } from 'react';
import { useContextSelection } from 'use-context-selection';
import ReactDOM from 'react-dom';

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

const useStore = (reducer: Reducer<any>, initState = emptyObject, middlewares = emptyMiddlewaresArray) => {
    const [state, dispatch] = React.useReducer(reducer, initState);
    const currentState = useRef(state);

    useIsomorphicLayoutEffect(() => {
        currentState.current = state;
    });

    const store = useMemo(() => {
        function enhancedDispatchFunc() {
            const chain = middlewares.map((middleware) => middleware(store));

            return compose(...chain)(dispatch);
        }

        return {
            getState: () => currentState.current,
            dispatch: (action: Action) => {
                const enhancedDispatch: Dispatch<Action> = enhancedDispatchFunc();

                return enhancedDispatch(action);
            },
        };
    }, [middlewares]);

    return { state, dispatch: store.dispatch };
};

export const createProvider = (StateContext: React.Context<any>, DispatchContext: React.Context<Dispatch<Action>>) => {
    function StoreProvider({ reducer, initialState = emptyObject, middlewares, children }: StoreProvider) {
        const { state, dispatch } = useStore(reducer, initialState, middlewares);

        return (
            <DispatchContext.Provider value={dispatch}>
                <StateContext.Provider value={state}>{children}</StateContext.Provider>
            </DispatchContext.Provider>
        );
    }

    return memo(StoreProvider);
};

export const createUseStore = (StateContext: React.Context<any>, DispatchContext: React.Context<Dispatch<Action>>) => (
    selector = emptySelector,
    actions: IHash<(...args: any[]) => Dispatch<Action>> = emptyObject,
    containerProps: React.ClassAttributes<any> = emptyObject,
) => {
    const dispatch = useContext<Dispatch<Action>>(DispatchContext);
    const dispatchProps = useMemo(getDispatchedProps(actions, dispatch, containerProps), [dispatch, actions]);
    const stateProps = useContextSelection(StateContext, (state: any) => selector(state, containerProps));

    return useMemo<React.ClassAttributes<any>>(
        () => ({
            ...containerProps,
            ...stateProps,
            actions: dispatchProps,
            dispatch,
        }),
        [containerProps, stateProps, dispatchProps],
    );
};

export const createStorage = (StateContext: React.Context<any>, DispatchContext: React.Context<Dispatch<Action>>) => ({
    useStore: createUseStore(StateContext, DispatchContext),
    StoreProvider: createProvider(StateContext, DispatchContext),
});
