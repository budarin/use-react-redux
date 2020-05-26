const reducerLoggerEnhancer = (reducer) => (state, action) => {
    const t1 = performance.now();

    const result = reducer(state, action);

    console.group(action.type);
    console.log(action);
    console.log('next state:', result, performance.now() - t1);
    console.groupEnd();

    return result;
};

export default reducerLoggerEnhancer;
