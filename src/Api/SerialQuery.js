// @flow

import * as React from 'react';

import Query from './Query';
import ApiStore from './Store';

import type { QueryDefinition, ApiResult, Endpoint, ApiResults } from './index';

// -----------------------------------------------------------------------------

export type SerialQueryProps = {|
  mergeResolver: (?any, ?any) => any,
  children: ApiResult => React.Node,
  endpoints: { [string]: Endpoint },
  queries: Array<QueryDefinition>,
  onUpdate?: ApiResult => void,
  store: ApiStore
|};

type SerialQueryState = {|
  stack: Array<QueryDefinition>,
  index: number
|};

// -----------------------------------------------------------------------------

export default class SerialQuery extends React.PureComponent<
  SerialQueryProps,
  SerialQueryState
> {

  state = {
    stack: [],
    index: 0
  };

  // ---------------------------------------------------------------------------

  static getDerivedStateFromProps (
    props: SerialQueryProps,
    state: SerialQueryState
  ): null | $Shape<SerialQueryState> {

    if (props.queries !== state.stack) {
      return {
        stack: props.queries,
        index: SerialQuery.findFirstUnresolved(props)
      };
    }
    return null;
  }

  static findFirstUnresolved = (props: SerialQueryProps): number => {

    if (! props.queries || ! Array.isArray(props.queries)) {
      return 0;
    }

    let index = 0;

    console.log(props.queries[index]);

    let i = props.store.getCached(props.queries[index]);

    while (i && i.loading === false && index <= props.queries.length) {
      console.log(i);
      index++;
      i = props.store.getCached(props.queries[index]);
    }

    console.log(i);

    console.log(index);

    return index;
  }

  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------

  onUpdate = (results: ApiResults, loading: boolean): void => {
    const { stack, index } = this.state;
    const { onUpdate } = this.props;

    const update = new Promise(resolve => {
      if (results[index + ''] && results[index + ''].loading === false) {
        this.setState({ index: index + 1 }, resolve);
      } else {
        resolve();
      }
    });

    update.then(_ => {
      onUpdate && onUpdate({
        loading: loading || index < stack.length -1,
        data: this.mergeResults(results)
      });
    })
  };

  // ---------------------------------------------------------------------------

  render (): React.Node {

    const { stack, index } = this.state;
    const { children, store, endpoints } = this.props;

    const queries: { [string]: QueryDefinition } = stack
      .filter((_, k) => k <= index)
      .reduce((prev, it, key) => ({ ...prev, [key]: it }), {});

    return <Query
      onUpdate={this.onUpdate}
      queries={queries}
      endpoints={endpoints}
      store={store}
    >
      {(results, loading) => {
        return children({
          loading: loading || index < stack.length -1,
          data: this.mergeResults(results)
        });
      }}
    </Query>;
  }
}
