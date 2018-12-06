import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import EndpointForm, { FormState } from './form';

class EndpointDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      prevEndpoint: null,
      endpoint: {
        route: '',
        status: 0,
        body: '',
        method: 'GET',
        redirect: '',
      },
      formState: FormState.readOnly,
    };

    this.handleDelete = this.handleDelete.bind(this);
    this.handleEditToggle = this.handleEditToggle.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  static get propTypes() {
    return {
      history: PropTypes.objectOf(PropTypes.any).isRequired,
      match: PropTypes.objectOf(PropTypes.any),
    };
  }

  static get defaultProps() {
    return {
      match: {},
    };
  }

  componentDidMount() {
    const { match } = this.props;
    if (match && match.params && match.params.id) {
      // Get the endpoint info and set the state
      fetch(`/__api/endpoints/${match.params.id}`, {
        method: 'GET',
      })
        .then(async res => {
          if (res.ok) {
            return res.json();
          }
          const body = await res.json();
          const rethrow = new Error(body.message);
          rethrow.error = body.error;
          throw rethrow;
        })
        .then(json => {
          this.setState({
            endpoint: json.endpoint,
          });
        })
        .catch(err => {
          this.setState({
            endpoint: {
              error: err.error,
              message: err.message,
            },
          });
        });
    }
  }

  handleInput(type, evt) {
    const { endpoint } = this.state;
    switch (type) {
      case 'status': {
        if (evt && evt.target) {
          if (evt.target.value === '') {
            this.setState({
              endpoint: {
                ...endpoint,
                status: 0,
              },
            });
          } else {
            const parsed = parseInt(evt.target.value, 10);
            if (!Number.isNaN(parsed)) {
              this.setState({
                endpoint: {
                  ...endpoint,
                  status: parsed,
                },
              });
            }
          }
        }
        break;
      }
      default: {
        if (evt && evt.target) {
          this.setState({
            endpoint: {
              ...endpoint,
              [type]: evt.target.value,
            },
          });
        }
      }
    }
  }

  handleDelete() {
    if (window.confirm('Do you really want to delete this endpoint?')) {
      const { match, history } = this.props;
      fetch(`/__api/endpoints/${match.params.id}`, {
        method: 'DELETE',
      })
        .then(res => res.json())
        .then(json => {
          console.log(JSON.stringify(json));
          history.push('/__dashboard/endpoints');
        })
        .catch(err => console.log(err));
    }
  }

  handleEditToggle() {
    const { formState, prevEndpoint, endpoint } = this.state;
    this.setState({
      formState: formState ? FormState.readOnly : FormState.isEditing,
      endpoint: formState ? prevEndpoint : endpoint,
      prevEndpoint: formState ? prevEndpoint : endpoint,
    });
  }

  handleUpdate(evt) {
    evt.preventDefault();
    const { endpoint } = this.state;
    const { method, route, status, body, redirect } = endpoint;
    const { history, match } = this.props;
    if (status === 0) {
      alert('Please specify a valid response status!');
      return;
    }

    fetch(`/__api/endpoints/${match.params.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        method,
        route,
        status,
        body,
        redirect,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(json => {
        if (!json.errors) {
          this.setState({
            prevEndpoint: json.endpoint,
            endpoint: json.endpoint,
            formState: FormState.readOnly,
          });
          history.replace(`/__dashboard/endpoints/${json.endpoint.id}`);
        }
      })
      .catch(err => console.log(err));
  }

  render() {
    const { endpoint, formState } = this.state;
    const { error, message } = endpoint;

    if (error) {
      return (
        <div className="col">
          <h3>Oops! There was an error retrieving this endpoint&apos;s details!</h3>
          {`Reason: ${message}`}
          <br />
          <Link to="/__dashboard/endpoints">Return to Endpoint List</Link>
        </div>
      );
    }

    const endpointFormProps = {
      endpoint,
      formState,
      onFormSubmit: this.handleUpdate,
      onInputChange: this.handleInput,
      onDelete: this.handleDelete,
      onEdit: this.handleEditToggle,
      onCancelEdit: this.handleEditToggle,
    };

    return <EndpointForm {...endpointFormProps} />;
  }
}

export default withRouter(EndpointDetail);
