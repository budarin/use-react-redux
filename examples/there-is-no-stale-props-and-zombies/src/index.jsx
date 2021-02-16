import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import appMiddlewares from './middlewares';
import { AppStoreProvider } from './appStorage';
import { initialState, reducer } from './ducks';
import { ListContainer } from './containers/ListContainer';

import './index.css';

ReactDOM.render(
    <AppStoreProvider reducer={reducer} initialState={initialState} middlewares={appMiddlewares}>
        <ListContainer />
    </AppStoreProvider>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
