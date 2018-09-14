// @flow

import * as React from 'react';

import MobxApiStore from './Store';
import defaultFetch from './examples/defaultFetch';

import type { Query as QueryType } from './Store';

export type Endpoints = { [string]: any => QueryType };

// -----------------------------------------------------------------------------

export type ApiContext = {|
  endpoints: Endpoints,
  store: MobxApiStore
|};

const defaultApiContext = {
  // $FlowFixMe
  store: new MobxApiStore(defaultFetch({})),
  endpoints: {}
};

// -----------------------------------------------------------------------------

const { Provider, Consumer } = React.createContext(defaultApiContext);

export { Consumer, defaultApiContext };

export default Provider;
