// eslint-disable-next-line no-unused-vars
import { bindActionCreators, ActionCreator, ActionCreatorsMapObject } from 'redux';
// eslint-disable-next-line no-unused-vars
import { ClassAttributes } from 'react';

type ActionCreatorFunc = (args: unknown, dispatch: Dispatch<Action>) => IHash<ActionCreator<Action>>;

const getDispatchedProps = (
    actions: ActionCreatorFunc | IHash<ActionCreator<Action>>,
    ownProps: ClassAttributes<unknown>,
    dispatch: Dispatch<Action>,
) => (): ActionCreatorsMapObject<unknown> => {
    if (typeof actions === 'function') {
        return actions(ownProps, dispatch);
    }

    // @ts-ignore
    return bindActionCreators(actions, dispatch);
};

export default getDispatchedProps;
