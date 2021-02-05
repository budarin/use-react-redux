import { compose } from 'redux';
import ReactDOM from 'react-dom';

import { createContext, useContextSelection } from 'use-context-selection';
import { useLayoutEffect, useEffect, useReducer, ClassAttributes, useContext, useMemo, useRef } from 'react';

import { getDispatchedProps } from './utils/getDispatchedProps';
import { setBatch, getBatch } from './utils/batch';

export const batch = getBatch();

setBatch(ReactDOM.unstable_batchedUpdates);

const noop = (_: any[]) => {};
const emptyObject = {};
const emptyMiddlewaresArray: Array<Middleware> = [];
const emptySelector = noop as (...args: any) => Partial<any>;
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface IAppStoreProvider {
    children: React.ReactNode;
    reducer: Reducer<any>;
    initialState: any;
    middlewares: Array<Middleware>;
}

interface IUseAppStore {
    selector?: (...args: any) => any;
    actions?: IHash<(...args: any[]) => Dispatch>;
    containerProps?: ClassAttributes<any>;
}

interface IUseAppStoreResult {
    props: any;
    actions: Record<string, any>;
    dispatch: Dispatch;
}

// eslint-disable-next-line max-lines-per-function
export const createStorage = () => {
    const StateContext = createContext<any>(emptyObject);
    const DispatchContext = createContext<Dispatch>(noop as Dispatch);

    let internalDispatch: (action: Action) => any;
    const getDispatch = () => internalDispatch;

    // eslint-disable-next-line max-lines-per-function
    const StoreProvider = (props: IAppStoreProvider): JSX.Element => {
        const { children, reducer, initialState = emptyObject, middlewares = emptyMiddlewaresArray } = props;
        const [state, dispatch] = useReducer(reducer, initialState);
        const currentState = useRef(state);

        useIsomorphicLayoutEffect(() => {
            currentState.current = state;

            return () => {
                currentState.current = {};
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
                    const enhancedDispatch: Dispatch = enhancedDispatchFunc() as Dispatch;
                    return enhancedDispatch(action);
                },
            };
        }, [middlewares]);

        internalDispatch = store.dispatch;

        return (
            <DispatchContext.Provider value={store.dispatch}>
                <StateContext.Provider value={state}>{children}</StateContext.Provider>
            </DispatchContext.Provider>
        );
    };

    // eslint-disable-next-line max-lines-per-function
    const useStore = ({
        selector = emptySelector,
        actions = emptyObject,
        containerProps = emptyObject,
    }: IUseAppStore): IUseAppStoreResult => {
        const dispatch = useContext<Dispatch>(DispatchContext);
        const dispatchProps = useMemo(getDispatchedProps(actions, dispatch, containerProps), [
            actions,
            dispatch,
            containerProps,
        ]);
        const stateProps = useContextSelection<any>(StateContext, (state: any) => selector(state, containerProps));

        return useMemo(
            () => ({
                props: {
                    ...containerProps,
                    ...stateProps,
                },
                actions: dispatchProps,
                dispatch,
            }),
            [containerProps, stateProps, dispatchProps, dispatch],
        );
    };

    return {
        useStore,
        getDispatch,
        StoreProvider,
    };
};
