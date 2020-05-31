const loggerMiddleware = (store) => (next) => (action) => {
    console.log('action', store.getState(), action);

    return next(action);
};

const appMiddlewares = [loggerMiddleware];

export default appMiddlewares;
