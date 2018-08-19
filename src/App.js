// @flow

import * as React from 'react';
import DevTools from 'mobx-react-devtools';

import ApiProvider, { defaultApiContext, ApiQuery } from './Api';

import endpoints from './Api/endpoints';

import './App.css';
import logo from './logo.svg';

type AppState = {|
  perPage: number,
  page: number
|};


// -----------------------------------------------------------------------------
class App extends React.Component<*, AppState> {

  state = {
    page: 1,
    perPage: 3
  };

  paginate = (dir: -1 | 1) => () => {
    this.setState(state => ({ page: Math.max(1, state.page + dir) }));
  }

  togglePerPage = (dir: -1 | 1) => () => {
    this.setState(state => ({ perPage: Math.max(1, state.perPage + dir) }));
  }

  // ---------------------------------------------------------------------------
  render (): React.Node {

    return <article className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <h1 className='App-title'>Hi!</h1>
      </header>

      <center>
        <button onClick={this.paginate(-1)}>
          prev
        </button>
        {this.state.page}
        <button onClick={this.paginate(1)}>
          next
        </button>
      </center>

      <center>
        <button onClick={this.togglePerPage(-1)}>
          -
        </button>
        {this.state.perPage}
        <button onClick={this.togglePerPage(1)}>
          +
        </button>
      </center>

      <ApiProvider value={{ ...defaultApiContext, endpoints }}>
        <ApiQuery queries={{
          users: ['user.getList', {
            per_page: this.state.perPage,
            page: this.state.page
          }],
          user: ['user.getDetail', { id: 5 }]
        }}>
          {(result, loading) => <pre>{JSON.stringify(result, null, 2)}</pre>}
        </ApiQuery>

      </ApiProvider>

      <DevTools />
    </article>;
  }
}

export default App;
