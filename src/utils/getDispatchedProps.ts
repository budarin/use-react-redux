const emptyObject: React.ClassAttributes<any> = {};

interface ActionCreator {
    (...args: any[]): Dispatch;
}

interface ActionCreators {
    (props: any, dispatch: Dispatch): IHash<ActionCreator>;
}

export const getDispatchedProps = (
    actions: ActionCreators | IHash<ActionCreator>,
    dispatch: Dispatch,
    containerProps = emptyObject,
) => (): Record<string, any> => {
    // Если actions <-> mapDispatchToProps - вызываем ее и возвращаем результат
    if (typeof actions === 'function') {
        // as mapDispatchToProps
        return actions(containerProps, dispatch);
    }

    // создаем из actionCreators - функции генерирующие методы вызывающие dispatch со сгенерированным payload
    const actionNames = Object.keys(actions);
    const len = actionNames.length;
    const dispatchedActions = Object.create(null) as Record<string, any>;

    if (len > 0) {
        const dispatchFunc = (key: string) => (...anyProps: any[]) => {
            const actionCreator = actions[key];
            const action = actionCreator && actionCreator(...anyProps);

            if (action && 'type' in action) {
                return dispatch(action) || action;
            }

            return action;
        };

        for (let i = 0; i < len; i++) {
            const key = actionNames[i];
            if (key) {
                if (typeof actions[key] !== 'function') {
                    console.warn(`Action creator ${key} in actions should be a function !`);

                    continue;
                }

                dispatchedActions[key] = dispatchFunc(key);
            }
        }
    }

    return dispatchedActions;
};
