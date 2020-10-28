declare interface IHash<T> {
    [key: string]: T;
}

declare interface Action {
    type: string;
    [key: string]: any;
}

declare interface Dispatch {
    <A extends Action>(action: A): any;
}

declare type Reducer<S> = <A extends Action>(state: S, action: A) => S;

declare interface MiddlewareAPI<S> {
    dispatch: Dispatch<S>;
    getState(): S;
}

declare interface Middleware {
    <Action>(api: MiddlewareAPI<Action>): (next: Dispatch<Action>) => Dispatch<Action>;
}

declare interface IStoreProvider {
    reducer: Reducer<any>;
    initialState: IHash<any>;
    middlewares: Array<Middleware>;
    children: React.ReactNode;
}
