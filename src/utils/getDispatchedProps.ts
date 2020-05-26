const getDispatchedProps = (actions: IHash<(...args: any[]) => Action>, dispatch: Dispatch<Action>) => () => {
    // if (typeof mapDispatchToProps === 'function') {
    //   return mapDispatchToProps(dispatch);
    // }

    const dispatchPropsKeys = Object.keys(actions);
    const len = dispatchPropsKeys.length;
    const res = Object.create(null);

    const dispatchFunc = (key: string) => (...anyProps: React.Props<unknown>[]): void | Action => {
        const action = actions[key](...anyProps);

        if (action && 'type' in action) {
            return dispatch(action) || action;
        }

        return action;
    };

    if (len > 0) {
        for (let i = 0; i < len; i++) {
            const key = dispatchPropsKeys[i];

            // @ts-ignore
            if (typeof actions[key] !== 'function') {
                console.warn(`${key} in actions must be a function!`);

                continue;
            }

            res[key] = dispatchFunc(key);
        }
    }

    return res;
};

export default getDispatchedProps;
