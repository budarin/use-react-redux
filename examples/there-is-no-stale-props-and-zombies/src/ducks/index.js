export const initialState = {
    a: { title: 'A' },
    b: { title: 'B' },
    c: { title: 'C' },
};

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'DELETE': {
            const newState = {};
            const keys = Object.keys(state);

            if (keys.length > 0) {
                keys.length = keys.length - 1;

                keys.forEach((key) => {
                    newState[key] = state[key];
                });
            }

            return newState;
        }
        case 'RESET':
            return { ...initialState };
        default:
            return state;
    }
};

export const simpleSelector = (state) => state;

export const actions = {
    delete: () => ({ type: 'DELETE' }),
    reset: () => ({ type: 'RESET' }),
};
