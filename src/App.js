// @flow

import * as React from 'react';
import DevTools from 'mobx-react-devtools';

import Pre from './Pre';
import ApiProvider, { defaultApiContext, ApiQuery, ApiSerialQuery } from './Api';

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
    return <center className='mt-4 mb-4'>
      <div className='btn-group btn-group-sm mr-4'>
        <button className='btn btn-secondary' disabled={this.state.page <= 1} onClick={this.paginate(-1)}>
          <ion-icon name='arrow-dropleft' />
        </button>
        <button className='btn btn-secondary btn-disabled' disabled>
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
        <button className='btn btn-light btn-disabled' disabled>
          {this.state.perPage}
        </button>
        <button className='btn btn-light' onClick={this.togglePerPage(1)}>
          <ion-icon name='add' />
        </button>
      </div>
    </center>;
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
                <Pre value={users} loading={users.loading} />
                <Pre value={user} loading={users.loading} />
              </div>
              <div className='col col-sm-6'>
                {loading || ! users.data
                  ? 'Loading...'
                  : <ApiSerialQuery
                    queries={users.data.list.map(it => (['user.getSingle', { id: it.id }]))}
                    mergeResolver={App.mergeUserDetails}
                  >
                    {result => loading ? 'loading...' : <Pre value={result} loading={result.loading} />}
                  </ApiSerialQuery>}
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
