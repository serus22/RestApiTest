// @flow

import * as React from 'react';

import { ApiMutation } from './Api';

import type { ApiAction } from './Api';

// -----------------------------------------------------------------------------

export type ExampleFormProps = {|
  user: {
    fullName: string,
    id: string
  }
|}

// -----------------------------------------------------------------------------

export default class ExampleForm extends React.PureComponent<ExampleFormProps> {

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

  render (): React.Node {

    const { user } = this.props;

    return <ApiMutation query={'user.putUsername'}>
      {(action, result) => <form onSubmit={this.submitForm(action)}>
        <div className='input-group mb-3'>
          <input
            defaultValue={user.fullName}
            className='form-control'
            placeholder='Username'
            name='name' />
          <div className='input-group-append'>
            <button type='submit' className='btn btn-outline-secondary'>Update !</button>
          </div>
        </div>
      </form>}
    </ApiMutation>
  }
}

