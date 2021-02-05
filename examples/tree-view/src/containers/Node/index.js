import React, { useMemo, memo } from 'react';
import { createSelector } from 'reselect';

import Node from '../../components/Node';
import { useAppStore } from '../../utils/storage';
import { actionCreators, selectNode } from '../../ducks';

// мемоизируем селектор потому что в нем есть computed prop - childCount
// !!! При удалении узла - computed prop может выдать ошибку из-за отсутствия узла в сторе
const createNodeSelector = () =>
    createSelector(selectNode, (item) => ({
        ...item,
        childCount: item ? item.childIds.length : 0,
    }));

const ConnectedNode = (ownProps) => {
    const selector = useMemo(createNodeSelector, []);
    const containerProps = useAppStore(selector, actionCreators, ownProps);

    return <Node {...containerProps} />;
};

export default memo(ConnectedNode);
