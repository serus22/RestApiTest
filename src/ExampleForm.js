// @flow

import * as React from 'react';

import { ApiMutation } from './Api';

import type { ApiAction, ApiResult, ApiCache } from './Api';

// -----------------------------------------------------------------------------

export type ExampleFormProps = {|
  user: {
    fullName: string,
    id: string
  }
|}

// -----------------------------------------------------------------------------

export default class ExampleForm extends React.PureComponent<ExampleFormProps> {

  formRef = React.createRef();

  // ---------------------------------------------------------------------------

  submitForm = (action: ApiAction) => (e: SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault();

    action && action({
      // $FlowFixMe
      name: e.currentTarget.name.value,
      id: this.props.user.id
    });
  }
  // ---------------------------------------------------------------------------

  update = (result: ApiResult, storeApi: { searchQuery: string => null | ApiCache }): null | ApiCache => {

    const matchedQueries = storeApi.searchQuery('user.getList');

    if (result && result.data && ! result.error) {
      let update = null;
      update = matchedQueries
        ? Object.keys(matchedQueries).reduce((prev, it) => {
          const query = matchedQueries[it];
          if (query.data && query.data.list) {
            // $FlowFixMe
            const index = query.data.list.findIndex(it => it.id === result.data.id);
            if (index > -1) {
              // $FlowFixMe
              query.data.list[index].fullName = result.data.name;
              // $FlowFixMe
              query.data.list[index] = {...query.data.list[index]};
              // $FlowFixMe
              query.data.list = [...query.data.list];
              query.data = { ...query.data };
              return {
                ...(prev || {}),
                [it]: { ...query }
              }
            }
          }
          return prev;
        }, null)
        : null;

      const match2 = storeApi.searchQuery('user.getSingle');

      // $FlowFixMe
      let first_name = result.data.name.split(' ');
      let last_name = first_name.splice(1).join(' ');
      first_name = first_name.splice(0, 1).join(' ');

      return match2
        ? Object.keys(match2).reduce((prev, it) => {
          const query = match2[it];
          // $FlowFixMe
          if (query && query.data && query.data.data && query.data.data.id === result.data.id) {
            query.data.data.first_name = first_name;
            query.data.data.last_name = last_name;
            return {
              ...(prev || {}),
              [it]: { ...query, data: { ...query.data, list: [...(query.data.list || [])] } }
            }
          }
          return prev;
        }, update)
        : update
    }

    return null;
  };

  // ---------------------------------------------------------------------------

  handleChange = (action: ApiAction) => (e: any): void => {
    action && action({
      // $FlowFixMe
      name: e.currentTarget.value,
      id: this.props.user.id
    });
  };

  // ---------------------------------------------------------------------------

  render (): React.Node {

    const { user } = this.props;

    return <ApiMutation query={'user.putUsername'} update={this.update}>
      {(action, result) => <form ref={this.formRef} onSubmit={this.submitForm(action)}>
        <div className='input-group mb-3'>
          <input
            onChange={this.handleChange(action)}
            className='form-control'
            placeholder='Username'
            value={user.fullName}
            name='name' />
          <div className='input-group-append'>
            <button type='submit' className='btn btn-outline-secondary'>Update !</button>
          </div>
        </div>
      </form>}
    </ApiMutation>
  }
}

