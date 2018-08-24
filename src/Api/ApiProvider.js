// @flow

import * as React from 'react';

import MobxApiStore from './Store';
import defaultFetch from './examples/defaultFetch';

import type { Endpoint } from './Store';

export type Endpoints = { [string]: Endpoint | Endpoints };

// -----------------------------------------------------------------------------

export type ApiContext = {|
  endpoints: Endpoints,
  store: MobxApiStore
|};

const defaultApiContext = {
  store: new MobxApiStore(defaultFetch({})),
  endpoints: {}
};

// -----------------------------------------------------------------------------

const { Provider, Consumer } = React.createContext(defaultApiContext);

export { Consumer, defaultApiContext };

export default Provider;
