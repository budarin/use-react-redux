// @ts-nocheck
const emptyObject = {};

function bindActionCreators(actionCreator, dispatch) {
    return function () {
        return dispatch(actionCreator.apply(this, arguments));
    };
}

const getDispatchedProps = (actions, dispatch, ownProps = emptyObject) => () => {
    if (typeof actions === 'function') {
        return actions(ownProps, dispatch);
    }

    // @ts-ignore
    return bindActionCreators(actions, dispatch);
};

export default getDispatchedProps;
