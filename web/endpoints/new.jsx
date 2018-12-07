import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import EndpointForm, { FormState } from './form';

class NewEndpoint extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: 200,
      body: '',
      route: '',
      method: 'GET',
      redirect: '',
      headers: [],
    };

    this.handleCreate = this.handleCreate.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  static get propTypes() {
    return {
      history: PropTypes.objectOf(PropTypes.any).isRequired,
    };
  }

  handleInput(type, evt) {
    switch (type) {
      case 'status': {
        if (evt && evt.target) {
          if (evt.target.value === '') {
            this.setState({
              status: 0,
            });
          } else {
            const parsed = parseInt(evt.target.value, 10);
            if (!Number.isNaN(parsed)) {
              this.setState({
                status: parsed,
              });
            }
          }
        }
        break;
      }
      case 'headers': {
        if (evt) {
          this.setState({
            headers: evt,
          });
        }
        break;
      }
      default: {
        if (evt && evt.target) {
          this.setState({
            [type]: evt.target.value,
          });
        }
      }
    }
  }

  handleCreate(evt) {
    evt.preventDefault();
    const { method, route, status, body, redirect, headers } = this.state;
    const { history } = this.props;
    if (status === 0) {
      // eslint-disable-next-line
      alert('Please specify a valid response status!');
      return;
    }

    fetch('/__api/endpoints', {
      method: 'POST',
      body: JSON.stringify({
        method,
        route,
        status,
        body,
        redirect,
        headers,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(json => {
        if (!json.errors) {
          history.push('/__dashboard/endpoints');
        }
      })
      // TODO: Handle this error
      .catch(err => console.log(err));
  }

  renderRedirectRouteInput() {
    const { status, redirect } = this.state;
    // Only render for 3xx responses
    if (status < 300 || status >= 400) {
      return undefined;
    }

    return (
      <div className="form-group col-md-6 no-gutters">
        <label htmlFor="newRedirectRouteInput" className="col">
          Redirect Route
          <input
            type="text"
            className="form-control"
            id="newRedirectRouteInput"
            onChange={this.generateInputHandler('redirect')}
            value={redirect}
            required
          />
        </label>
      </div>
    );
  }

  render() {
    const endpointFormProps = {
      endpoint: this.state,
      formState: FormState.isCreating,
      onInputChange: this.handleInput,
      onFormSubmit: this.handleCreate,
    };

    return <EndpointForm {...endpointFormProps} />;
  }
}

export default withRouter(NewEndpoint);
