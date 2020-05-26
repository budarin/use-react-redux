interface IHash<T> {
    [key: string]: T;
}

interface Action {
    type: any;
}

interface Dispatch<S> {
    <A extends Action>(action: A): any;
}

type Reducer<S> = <A extends Action>(state: S, action: A) => S;

interface Middleware {
    <Action>(api: MiddlewareAPI<Action>): (next: Dispatch<Action>) => Dispatch<Action>;
}

interface StoreProvider {
    reducer: Reducer<any>;
    initialState: IHash<any>;
    middlewares: Array<Middleware>;
    children: React.ReactNode;
}
