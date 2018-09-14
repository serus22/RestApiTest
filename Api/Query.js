// @flow

import * as React from 'react';
import { observe } from 'mobx';

import ApiStore from './Store';
import type { ApiResult, ApiQueryProps, Query as QueryType } from './index';

// -----------------------------------------------------------------------------

export type QueryDefinition = [string, any];

export type ApiResults = {
  [string]: ApiResult
};

type QueryState = {|
  endpoints: { [string]: string }, // generated queries
  results: ApiResults,
  loading: boolean
|};

export type QueryProps = $Exact<{
  ...ApiQueryProps,
  endpoints: { [string]: any => QueryType }, // global definition
  store: ApiStore // data storage,
}>;

const InitialState: QueryState = {
  loading: false,
  endpoints: {},
  results: {}
};

// -----------------------------------------------------------------------------

export default class Query extends React.PureComponent<QueryProps, QueryState> {

  disposer: any;

  // // ------------------------------------------------------------------------

  constructor (props: QueryProps): void {
    super(props);

    if (! props.store) {
      throw new Error('Missing store instance');
    }

    if (! props.endpoints) {
      throw new Error('Missing endpoints definition');
    }

    this.disposer = observe(this.props.store, 'cache', this.listener);

    this.state = {
      ...InitialState,
      ...(Query.getDerivedStateFromProps(props, InitialState) || {})
    };

  }

  // // ------------------------------------------------------------------------

  static getDerivedStateFromProps (
    props: QueryProps,
    prevState: QueryState
  ): null | $Shape<QueryState> {

    const results = { ...(prevState.results || {}) };
    const queryIds = Object.keys(props.queries);
    const endpoints = { ...prevState.endpoints };
    let update = false;

    queryIds.forEach(key => {
      const template = props.endpoints[props.queries[key][0]];

      if (! template || typeof template !== 'function') {
        throw new Error('Invalid enpoint name "' + props.queries[key][0] + '"');
      }

      const endpoint = template(props.queries[key][1]);
      const id = props.store.getId(endpoint);

      if (id !== prevState.endpoints[key]) {
        endpoints[key] = id;
        results[key] = props.store.getCachedById(id);

        if (! results[key]) {
          results[key] = { loading: true };
          props.store.get(endpoint, props.queries[key]);
        }
        update = true;
      }

    }, {});

    const prevQueries = Object.keys(prevState.endpoints).length;
    const actualQueries = Object.keys(endpoints).length;

    if (! update && prevQueries === actualQueries) {
      return null;
    }

    const loading = Object.keys(results).some(key => results[key].loading);

    props.onUpdate && props.onUpdate(
      results,
      loading
    );

    return {
      endpoints,
      loading,
      results
    };
  }

  // // ------------------------------------------------------------------------

  listener = (change: any) => {

    this.setState(state => {
      const results = { ...state.results };
      let update = false;

      Object.keys(this.state.endpoints).forEach(key => {
        const id = this.state.endpoints[key];
        const n = change.newValue[id];
        if (change.oldValue[key] !== n && results[key] !== n) {
          if (change.newValue[id]) {
            results[key] = change.newValue[id];
          } else {
            this.props.store.get(
              this.state.endpoints[key],
              this.props.queries[key]
            );
          }
          update = true;
        }
      });

      if (update) {

        const loading = Object.keys(results).some(k => results[k].loading);
        // trigger parent event;
        this.props.onUpdate && this.props.onUpdate(
          results,
          loading
        );

        return {
          loading,
          results
        };
      }

      return null;
    });
  };

  // // ------------------------------------------------------------------------

  componentDidMount (): void {
    if (! this.disposer) {
      this.disposer = observe(this.props.store, 'cache', this.listener);
    }
  }

  // // ------------------------------------------------------------------------

  componentWillUnmount (): void {
    this.disposer();
  }

  // // ------------------------------------------------------------------------

  render (): React.Node {

    const { results, loading } = this.state;

    return this.props.children
      ? this.props.children(results, loading)
      : null;
  }
}
