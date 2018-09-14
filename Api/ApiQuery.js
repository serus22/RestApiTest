// @flow

import * as React from 'react';

import Query from './Query';
import { Consumer } from './ApiProvider';

import type { ApiResults, QueryDefinition } from './index';

// -----------------------------------------------------------------------------

export type ApiQueryProps = $Exact<{
  children?: (ApiResults, boolean) => React.Node,
  onUpdate?: (ApiResults, boolean) => void,
  queries: { [string]: QueryDefinition },
  id?: string
}>;

// -----------------------------------------------------------------------------

export default class ApiQuery extends React.PureComponent<ApiQueryProps> {

  render (): React.Node {
    return <Consumer>
      {({ store, endpoints }) => <Query
        endpoints={endpoints}
        store={store}
        {...this.props} />}
    </Consumer>;
  }
}
