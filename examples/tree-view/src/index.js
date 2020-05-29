import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import reducer from './ducks';
import App from './components/App';
import Node from './containers/Node';
import generateTree from './utils/generateTree';
import appMiddlewares from './middlewares';
import { StoreProvider } from './utils/storage';

import './index.css';

const tree = generateTree();

ReactDOM.render(
    <App>
        <StoreProvider reducer={reducer} initialState={tree} middlewares={appMiddlewares}>
            <Node id={0} />
        </StoreProvider>
    </App>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
