/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';

import ConnectedNode from '../../containers/Node';

const Node = ({ actions, parentId, id, counter, childIds, childCount }) => {
    const handleIncrementClick = () => {
        actions.increment(id);
    };

    const handleAddChildClick = (e) => {
        e.preventDefault();

        const childId = actions.createNode().nodeId;
        actions.addChild(id, childId);
    };

    const handleRemoveClick = (e) => {
        e.preventDefault();

        actions.removeChild(parentId, id);
        actions.deleteNode(id);
    };

    const renderChild = (childId) => {
        return (
            <li key={childId}>
                <ConnectedNode id={childId} parentId={id} />
            </li>
        );
    };

    return (
        <div>
            Counter: {counter} <span style={{ color: 'gray' }}> ({childCount}</span>
            {') '}
            <button onClick={handleIncrementClick}>+</button>{' '}
            {typeof parentId !== 'undefined' && (
                <a href="#" onClick={handleRemoveClick} style={{ color: 'lightgray', textDecoration: 'none' }}>
                    ×
                </a>
            )}
            <ul>
                {childIds.map(renderChild)}
                <li key="add">
                    <a href="#" onClick={handleAddChildClick}>
                        Add child
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default Node;
