import React from "react";

export const createCounter = (no) => ({ counter, actions }) => {
  return (
    <div>
      <p>
        Счетчик{no}: {counter}
        <br />
        <button onClick={actions.increment}>Увеличить</button>{" "}
        <button onClick={actions.decrement}>Уменьшить</button>
      </p>
    </div>
  );
};
