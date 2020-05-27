import React, { memo, useMemo, useContext, useLayoutEffect, useEffect, useRef } from 'react';
import { useContextSelection } from 'use-context-selection';
import { unstable_batchedUpdates as batch } from 'react-dom';

import getDispatchedProps from './utils/getDispatchedProps';
import { setBatch } from './utils/batch';
import compose from './utils/compose';

export { createContext } from 'use-context-selection';

const emptyObject = {};
const emptyMiddlewaresArray: Array<Middleware> = [];
const emptySelector = (x: unknown, _: React.ClassAttributes<unknown>) => x;
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

setBatch(batch);

const useStore = (reducer: Reducer<unknown>, initState = emptyObject, middlewares = emptyMiddlewaresArray) => {
    const [state, dispatch] = React.useReducer(reducer, initState);
    const currentState = useRef(state);

    useIsomorphicLayoutEffect(() => {
        currentState.current = state;
    });

    const store = useMemo(() => {
        function enhancedDispatchFunc() {
            const chain = middlewares.map((middleware) => middleware(store));

            // @ts-ignore
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

export const createProvider = (
    StateContext: React.Context<unknown>,
    DispatchContext: React.Context<Dispatch<Action>>,
) => {
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

export const createUseStore = (
    StateContext: React.Context<unknown>,
    DispatchContext: React.Context<Dispatch<Action>>,
) => (
    selector = emptySelector,
    actions: IHash<(...args: unknown[]) => Action> = emptyObject,
    containerProps: React.ClassAttributes<unknown> = emptyObject,
) => {
    const dispatch = useContext<Dispatch<Action>>(DispatchContext);
    const dispatchProps = useMemo(getDispatchedProps(actions, containerProps, dispatch), [dispatch, actions]);
    const stateProps = useContextSelection(StateContext, (state: unknown) => selector(state, containerProps));

    return useMemo<React.ClassAttributes<unknown>>(
        () => ({
            ...containerProps,
            ...stateProps,
            actions: dispatchProps,
        }),
        [containerProps, stateProps, dispatchProps],
    );
};
