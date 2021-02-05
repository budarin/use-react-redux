const emptyObject: React.ClassAttributes<any> = {};

interface ActionCreator {
    (...args: any[]): Dispatch;
}

interface ActionCreators {
    (props: any, dispatch: Dispatch): IHash<ActionCreator>;
}

export const getDispatchedProps = (
    mapDispatchToProps: ActionCreators | IHash<ActionCreator>,
    dispatch: Dispatch,
    ownProps = emptyObject,
) => (): Record<string, any> => {
    // Если mapDispatchToProps - функция - вызываем ее и возвращаем результат
    if (typeof mapDispatchToProps === 'function') {
        return mapDispatchToProps(ownProps, dispatch);
    }

    // создаем из actionCreators - функции генерирующие методы вызывающие dispatch со сгенерированным payload
    const dispatchPropsKeys = Object.keys(mapDispatchToProps);
    const len = dispatchPropsKeys.length;
    const res = Object.create(null) as Record<string, any>;

    if (len > 0) {
        const dispatchFunc = (key: string) => (...anyProps: any[]) => {
            const method = mapDispatchToProps[key];
            const action = method && method(...anyProps);

            if (action && 'type' in action) {
                return dispatch(action) || action;
            }

            return action;
        };

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
