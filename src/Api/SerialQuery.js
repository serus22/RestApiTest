// @flow

import * as React from 'react';

import ApiQuery from './ApiQuery';

import type { QueryDefinition, ApiResult, ApiResults } from './index';


export type SerialQueryProps = {|
  children: ApiResult => React.Node,
  mergeResolver: (?any, ?any) => any,
  queries: Array<QueryDefinition>,
|};

type SerialQueryState = {|
|};

// -----------------------------------------------------------------------------

export default class SerialQuery extends React.PureComponent<SerialQueryProps, SerialQueryState> {

  mergeResults = (results: ApiResults): any => {

    const keys = Object.keys(results);
    if (keys.length < 1) {
      return this.props.mergeResolver();
    }

    const first: ?string = keys.splice(0, 1)[0];

    if (typeof first !== 'string' && typeof first !== 'number') {
      return this.props.mergeResolver();
    }

    return keys.reduce((prev, key) => {
      if (results[key].data) {
        return this.props.mergeResolver(prev, results[key].data);
      }
      return prev;
    }, this.props.mergeResolver(null, results[first].data))
  };

  render (): React.Node {

    const { queries, children, mergeResolver, ...rest } = this.props;
    const stack = queries.reduce((prev, it, key) => ({ ...prev, [key]: it }), {});

    return <ApiQuery queries={stack} {...rest}>
      {(results, loading) => {
        return children({ loading, data: this.mergeResults(results) });
      }}
    </ApiQuery>;
  }
}
