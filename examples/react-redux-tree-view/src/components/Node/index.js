import React from "react";
import ConnectedNode from "../../containers/Node";

export const Node = (props) => {
  const handleIncrementClick = () => {
    const { increment, id } = props;
    increment(id);
  };

  const handleAddChildClick = (e) => {
    e.preventDefault();

    const { addChild, createNode, id } = props;
    const childId = createNode().nodeId;
    addChild(id, childId);
  };

  const handleRemoveClick = (e) => {
    e.preventDefault();

    const { removeChild, deleteNode, id } = props;
    removeChild(props.parentId, id);
    deleteNode(id);
  };

  const renderChild = (childId) => {
    const { id } = props;
    return (
      <li key={childId}>
        <ConnectedNode id={childId} parentId={id} />
      </li>
    );
  };

  const { counter, parentId, childIds, childCount } = props;

  return (
    <div>
      Counter: {counter} <span style={{ color: "gray" }}> ({childCount}</span>
      {") "}
      <button onClick={handleIncrementClick}>+</button>{" "}
      {typeof parentId !== "undefined" && (
        <a
          href="#"
          onClick={handleRemoveClick} // eslint-disable-line jsx-a11y/anchor-is-valid
          style={{ color: "lightgray", textDecoration: "none" }}
        >
          ×
        </a>
      )}
      <ul>
        {childIds.map(renderChild)}
        <li key="add">
          <a
            href="#" // eslint-disable-line jsx-a11y/anchor-is-valid
            onClick={handleAddChildClick}
          >
            Add child
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Node;
