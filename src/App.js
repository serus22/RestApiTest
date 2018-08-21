// @flow

import * as React from 'react';
import DevTools from 'mobx-react-devtools';

import ApiProvider, { defaultApiContext, ApiQuery, SerialQuery } from './Api';

import endpoints from './Api/examples/endpoints';

import './App.css';
import reactLogo from './logo.svg';
import mobxLogo from './mobx.svg';

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

  renderHeader (loading: boolean): React.Node {
    return <div className='row'>
      <div className='col-sm-6 offset-sm-2'>
        <center className='mt-4 mb-4'>
          <div className='btn-group btn-group-sm mr-4'>
            <button className='btn btn-secondary' disabled={this.state.page <= 1} onClick={this.paginate(-1)}>
              <ion-icon name='arrow-dropleft' />
            </button>
            <button className='btn btn-secondary btn-disabled'>
              {this.state.page}
            </button>
            <button className='btn btn-secondary' onClick={this.paginate(1)}>
              <ion-icon name='arrow-dropright' />
            </button>
          </div>

          <div className='btn-group btn-group-sm'>
            <button className='btn btn-light' disabled={this.state.perPage <= 1} onClick={this.togglePerPage(-1)}>
              <ion-icon name='remove' />
            </button>
            <button className='btn btn-light btn-disabled'>
              {this.state.perPage}
            </button>
            <button className='btn btn-light' onClick={this.togglePerPage(1)}>
              <ion-icon name='add' />
            </button>
          </div>
        </center>
      </div>
      <div className='col-sm-2'>
        {loading && <div className='spinner mt-4 mb-4'>
          <div className='bounce1' />
          <div className='bounce2' />
          <div className='bounce3' />
        </div>}
      </div>
    </div>;
  }

  static mergeUserDetails (prev: ?Object, next: ?Object): Array<Object> {
    return [...(prev || []), ...(next ? [next.data] : [])];
  }

  // ---------------------------------------------------------------------------

  render (): React.Node {

    return <article className='App'>
      <header className='App-header'>
        <img src={reactLogo} className='App-logo' alt='react' />
        <img src={mobxLogo} className='App-logo2' alt='mobx' />
      </header>

      <ApiProvider value={{ ...defaultApiContext, endpoints }}>
        <ApiQuery queries={{
          users: ['user.getList', {
            per_page: this.state.perPage,
            page: this.state.page
          }],
          user: ['user.getSingle', { id: 24 }]
        }}>
          {({ users, user }, loading) => <div className='container'>
            {this.renderHeader(loading)}

            <div className='row'>
              <div className='col col-sm-6'>
                <pre>{JSON.stringify(users, null, 2)}</pre>
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </div>
              <div className='col col-sm-6'>
                {loading || ! users.data
                  ? 'Loading...'
                  : <SerialQuery
                    queries={users.data.list.map(it => (['user.getSingle', { id: it.id }]))}
                    mergeResolver={App.mergeUserDetails}
                  >
                    {result => loading ? 'loading...' : <pre>{JSON.stringify(result, null, 2)}</pre>}
                  </SerialQuery>}
              </div>
            </div>

          </div>}
        </ApiQuery>
      </ApiProvider>

      <DevTools />
    </article>;
  }
}

export default App;
