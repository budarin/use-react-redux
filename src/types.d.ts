interface IHash<T> {
    [key: string]: T;
}

interface Action {
    type: string;
    [key: string]: unknown;
}

interface Dispatch<S> {
    <A extends Action>(action: A): unknown;
}

type Reducer<S> = <A extends Action>(state: S, action: A) => S;

interface MiddlewareAPI<S> {
    dispatch: Dispatch<S>;
    getState(): S;
}

interface Middleware {
    <Action>(api: MiddlewareAPI<Action>): (next: Dispatch<Action>) => Dispatch<Action>;
}

interface StoreProvider {
    reducer: Reducer<unknown>;
    initialState: IHash<unknown>;
    middlewares: Array<Middleware>;
    children: React.ReactNode;
}
