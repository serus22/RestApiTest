// @flow

import * as React from 'react';

import Query from './Query';
import ApiStore from './Store';

import type { QueryDefinition, ApiResult, Endpoint, ApiResults } from './index';

// -----------------------------------------------------------------------------

export type SerialQueryProps = {|
  endpoints: { [string]: any => Endpoint },
  mergeResolver: (?any, ?any) => any,
  children: ApiResult => React.Node,
  queries: Array<QueryDefinition>,
  onUpdate?: ApiResult => void,
  store: ApiStore
|};

type SerialQueryState = {|
  queries: { [string]: QueryDefinition },
  stack: Array<QueryDefinition>,
  index: number
|};

// -----------------------------------------------------------------------------

export default class SerialQuery extends React.PureComponent<
  SerialQueryProps,
  SerialQueryState
> {

  state = {
    queries: {},
    stack: [],
    index: 0
  };

  // ---------------------------------------------------------------------------

  static getDerivedStateFromProps (
    props: SerialQueryProps,
    state: SerialQueryState
  ): null | $Shape<SerialQueryState> {


    if (props.queries !== state.stack) {
      let index = SerialQuery.findFirstUnresolved(props);
      return {
        queries: index > -1
          ? props.queries
            .slice(0, index + 1)
            .reduce((prev, it, key) => ({ ...prev, [key]: it }), {})
          : {},
        stack: props.queries,
        index
      };
    }
    return null;
  }

  // ---------------------------------------------------------------------------

  static findFirstUnresolved = (props: SerialQueryProps): number => {

    if (! props.queries || ! Array.isArray(props.queries)) {
      return 0;
    }

    let index = -1;
    let i = null;
    let q;

    do {
      q = props.queries[index + 1];
      if (! q) {
        break;
      }
      let endpoint = props.endpoints[q[0]](q[1]);
      i = props.store.getCached(endpoint);
      index++;
    } while (index < props.queries.length && i && i.loading === false);
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

      let i = SerialQuery.findFirstUnresolved(this.props);

      if (results[index + ''] && results[index + ''].loading === false && i !== this.state.index) {
        this.setState({
          index: i,
          queries: this.props.queries
            .slice(0, i + 1)
            .reduce((prev, it, key) => ({ ...prev, [key]: it }), {}),
          }, resolve);
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

    const { stack, index, queries } = this.state;
    const { children, store, endpoints } = this.props;

    return <Query
      onUpdate={this.onUpdate}
      endpoints={endpoints}
      queries={queries}
      store={store}
    >
      {(results, loading) => {
        return children({
          loading: loading || index < stack.length - 1,
          data: this.mergeResults(results)
        });
      }}
    </Query>;
  }

  // ---------------------------------------------------------------------------

  componentDidUpdate (): void {
    console.log(this.state.index);
  }
}
