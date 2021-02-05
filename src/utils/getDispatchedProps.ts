const emptyObject: React.ClassAttributes<any> = {};

interface ActionCreator {
    (...args: any[]): Dispatch;
}

interface ActionCreators {
    (props: any, dispatch: Dispatch): IHash<ActionCreator>;
}

// eslint-disable-next-line max-lines-per-function
export const getDispatchedProps = (
    mapDispatchToProps: ActionCreators | IHash<ActionCreator>,
    dispatch: Dispatch,
    ownProps = emptyObject,
    // eslint-disable-next-line complexity, max-lines-per-function
) => (): Record<string, any> => {
    if (typeof mapDispatchToProps === 'function') {
        return mapDispatchToProps(ownProps, dispatch);
    }

    const dispatchPropsKeys = Object.keys(mapDispatchToProps);
    const len = dispatchPropsKeys.length;
    const res = Object.create(null) as Record<string, any>;

    const dispatchFunc = (key: string) => (...anyProps: any[]) => {
        const method = mapDispatchToProps[key];
        const action = method && method(...anyProps);

        if (action && 'type' in action) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return dispatch(action) || action;
        }

        return action;
    };

    if (len > 0) {
        // eslint-disable-next-line fp/no-loops
        for (let i = 0; i < len; i++) {
            const key = dispatchPropsKeys[i];
            if (key) {
                // eslint-disable-next-line max-depth
                if (typeof mapDispatchToProps[key] !== 'function') {
                    console.warn(`Action ${key} in mapDispatchToProps should be a function!`);

                    continue;
                }

                res[key] = dispatchFunc(key);
            }
        }
    }

    return res;
};
