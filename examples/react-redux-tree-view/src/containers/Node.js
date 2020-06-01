import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import useAction from '../hooks/useActions';
import Node from '../components/Node';
import { increment, createNode, deleteNode, addChild, removeChild } from '../actions';

const selectoNode = (state, ownProps) => state[ownProps.id];

const createNodeSelector = () =>
    createSelector(selectoNode, (item) => ({
        ...item,
        childCount: item.childIds.length,
    }));

const ConnectedNode = (ownProps) => {
    const selector = useMemo(createNodeSelector, []);
    const stateProps = useSelector((state) => selector(state, ownProps));
    const dispatchedActions = useAction({
        increment,
        createNode,
        deleteNode,
        addChild,
        removeChild,
    });

    return <Node {...ownProps} {...stateProps} {...dispatchedActions} />;
};

export default ConnectedNode;
