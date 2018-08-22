// @flow

import * as React from 'react';

import SerialQuery from './SerialQuery';
import { Consumer } from './ApiProvider';

import type { ApiResult, QueryDefinition } from './index';

type ApiSerialQueryProps = {|
  mergeResolver: (?any, ?any) => any,
  children: ApiResult => React.Node,
  queries: Array<QueryDefinition>,
  onUpdate?: ApiResult => void
|};

export default class ApiSerialQuery extends React.PureComponent<ApiSerialQueryProps> {

  render (): React.Node {
    return <Consumer>
      {({ store, endpoints }) => <SerialQuery
        endpoints={endpoints}
        store={store}
        {...this.props} />}
    </Consumer>;
  }
}
