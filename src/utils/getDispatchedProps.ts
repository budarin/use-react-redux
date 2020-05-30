const emptyObject: React.ClassAttributes<any> = {};

const getDispatchedProps = (
    mapDispatchToProps: Function | IHash<any>,
    dispatch: Dispatch<Action>,
    ownProps = emptyObject,
) => () => {
    if (typeof mapDispatchToProps === 'function') {
        return mapDispatchToProps(ownProps, dispatch);
    }

    const dispatchPropsKeys = Object.keys(mapDispatchToProps);
    const len = dispatchPropsKeys.length;
    const res = Object.create(null);

    const dispatchFunc = (key: string) => (...anyProps: any[]) => {
        const action = mapDispatchToProps[key](...anyProps);

        if (action && 'type' in action) {
            return dispatch(action) || action;
        }

        return action;
    };

    if (len > 0) {
        for (let i = 0; i < len; i++) {
            const key = dispatchPropsKeys[i];

            // @ts-ignore
            if (typeof mapDispatchToProps[key] !== 'function') {
                console.warn(`Action ${key} in mapDispatchToProps should be a function!`);

                continue;
            }

            res[key] = dispatchFunc(key);
        }
    }

    return res;
};

export default getDispatchedProps;
