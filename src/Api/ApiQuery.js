// @flow

import * as React from 'react';

import Query from './Query';
import { Consumer } from './ApiProvider';

import type { Results } from './Query';

type ApiQueryProps = {|
  children: (Results, boolean) => React.Node,
  queries: { [string]: [string, {}] }
|};

export default class ApiQuery extends React.PureComponent<ApiQueryProps> {

  render (): React.Node {
    return <Consumer>
      {({ store, endpoints }) => <Query
        endpoints={endpoints}
        store={store}
        {...this.props} />}
    </Consumer>
  }
}
