// @flow

import * as React from 'react';

import Query from './Query';
import { Consumer } from './ApiProvider';

import type { ApiResults, QueryDefinition } from './index';

type ApiQueryProps = {|
  children: (ApiResults, boolean) => React.Node,
  onUpdate?: (ApiResults, boolean) => void,
  queries: { [string]: QueryDefinition }
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
