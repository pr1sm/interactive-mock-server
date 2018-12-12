import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import EndpointForm, { FormState } from './form';
import queries from '../utils/queries';
import mutations from '../utils/mutations';

class EndpointDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      prevEndpoint: null,
      endpoint: {
        id: null,
        route: '',
        method: 'GET',
        response: {
          statusCode: 0,
          body: '',
          redirect: '',
          headers: [],
        },
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
      fetch('/__api/endpoints/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: queries.endpoints.single,
          variables: { id: match.params.id },
        }),
      })
        .then(async res => {
          const json = await res.json();
          if (!res.ok) {
            const error = new Error('ResponseError');
            error.json = json;
            throw error;
          }
          if (json.errors) {
            const error = new Error('GraphQLError');
            error.json = json;
            throw error;
          }
          return json;
        })
        .then(json => {
          this.setState({
            endpoint: {
              ...json.data.endpoint,
              forceUpdate: true,
            },
          });
        })
        .catch(err => {
          // TODO: Handle this error
          this.setState({
            endpoint: {
              errors: err.json.errors,
            },
          });
          console.log(`Received error response: ${JSON.stringify(err.json, null, 2)}`);
        });
    }
  }

  handleInput(type, evt) {
    const { endpoint } = this.state;
    switch (type) {
      case 'statusCode': {
        if (evt && evt.target) {
          if (evt.target.value === '') {
            this.setState({
              endpoint: {
                ...endpoint,
                response: {
                  ...endpoint.response,
                  statusCode: 0,
                },
              },
            });
          } else {
            const parsed = parseInt(evt.target.value, 10);
            if (!Number.isNaN(parsed)) {
              this.setState({
                endpoint: {
                  ...endpoint,
                  response: {
                    ...endpoint.response,
                    statusCode: parsed,
                  },
                },
              });
            }
          }
        }
        break;
      }
      case 'headers': {
        if (evt) {
          this.setState({
            endpoint: {
              ...endpoint,
              response: {
                ...endpoint.response,
                headers: evt,
              },
            },
          });
        }
        break;
      }
      case 'body':
      case 'redirect': {
        if (evt && evt.target) {
          this.setState({
            endpoint: {
              ...endpoint,
              response: {
                ...endpoint.response,
                [type]: evt.target.value,
              },
            },
          });
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
    // eslint-disable-next-line
    if (window.confirm('Do you really want to delete this endpoint?')) {
      const { match, history } = this.props;

      fetch('/__api/endpoints/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: mutations.endpoints.delete,
          variables: { id: match.params.id },
        }),
      })
        .then(async res => {
          const json = await res.json();
          if (!res.ok) {
            const error = new Error('ResponseError');
            error.json = json;
            throw error;
          }
          if (json.errors) {
            const error = new Error('GraphQLError');
            error.json = json;
            throw error;
          }
          return json;
        })
        .then(() => {
          history.push('/__dashboard/endpoints');
        })
        // TODO: Handle this error
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
    const { statusCode } = endpoint.response;
    const { history, match } = this.props;
    if (statusCode === 0) {
      // eslint-disable-next-line
      alert('Please specify a valid response status!');
      return;
    }

    const data = {
      ...endpoint,
      id: undefined,
      forceUpdate: undefined,
    };

    fetch('/__api/endpoints/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: mutations.endpoints.replace,
        variables: {
          id: match.params.id,
          data,
        },
      }),
    })
      .then(async res => {
        const json = await res.json();
        if (!res.ok) {
          const error = new Error('ResponseError');
          error.json = json;
          throw error;
        }
        if (json.errors) {
          const error = new Error('GraphQLError');
          error.json = json;
          throw error;
        }
        return json;
      })
      .then(json => {
        this.setState({
          prevEndpoint: json.data.replaceEndpoint,
          endpoint: json.data.replaceEndpoint,
          formState: FormState.readOnly,
        });
        history.replace(`/__dashboard/endpoints/${json.data.replaceEndpoint.id}`);
      })
      // TODO: Handle this error
      .catch(err => console.log(err));
  }

  render() {
    const { endpoint, formState } = this.state;
    const { errors } = endpoint;

    if (errors) {
      return (
        <div className="col">
          <h3>Oops! There were errors retrieving this endpoint&apos;s details!</h3>
          {`Reason: ${errors[0].message}`}
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
