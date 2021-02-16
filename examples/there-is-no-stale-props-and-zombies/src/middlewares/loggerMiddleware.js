export const loggerMiddleware = () => (next) => (action) => {
    console.log('action', action);

    return next(action);
};
