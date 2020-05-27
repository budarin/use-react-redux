// @ts-nocheck
import bindActionCreators from './bindActionCreators';

const emptyObject = {};

const getDispatchedProps = (actions, dispatch, ownProps = emptyObject) => () => {
    if (typeof actions === 'function') {
        return actions(ownProps, dispatch);
    }

    // @ts-ignore
    return bindActionCreators(actions, dispatch);
};

export default getDispatchedProps;
