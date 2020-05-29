// Default to a dummy "batch" implementation that just runs the callback

// In Blocking Mode and Concurrent Mode, all setStates are batched by default
function defaultNoopBatch(callback: () => void): void {
    callback();
}

let batch = defaultNoopBatch;

// Allow injecting another batching function later
export const setBatch = (newBatch: typeof defaultNoopBatch) => (batch = newBatch);

// Supply a getter just to skip dealing with ESM bindings
export const getBatch = () => batch;
