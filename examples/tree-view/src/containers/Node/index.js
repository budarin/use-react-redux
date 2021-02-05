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

const ConnectedNode = (containerProps) => {
    const selector = useMemo(createNodeSelector, []);
    const props = useAppStore({
        selector,
        actions: actionCreators,
        containerProps,
    });

    return <Node {...props} />;
};

export default memo(ConnectedNode);
