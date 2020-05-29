import React from 'react';

import './index.css';

const isDev = process.env.NODE_ENV === 'development';

function App({ children }) {
    return (
        <div className="app">
            <h1>Redux on hooks {isDev ? '(dev)' : '(prod)'}</h1>
            <div className="viewport">{children}</div>
        </div>
    );
}

export default App;
