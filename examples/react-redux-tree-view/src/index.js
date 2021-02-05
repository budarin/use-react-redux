import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import reducer from './reducers';
import generateTree from './generateTree';
import Node from './containers/Node';
import App from './components/App';

import './index.css';

const loggerMiddleware = () => (next) => (action) => {
    console.log('action', action);
    return next(action);
};

const tree = generateTree();
const store = createStore(
    reducer,
    tree,
    applyMiddleware(loggerMiddleware),
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

render(
    <App>
        <Provider store={store}>
            <Node id={0} />
        </Provider>
    </App>,
    document.getElementById('root'),
);
