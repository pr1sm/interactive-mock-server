import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import EndpointForm, { FormState } from './form';
import graphqlFetch from '../utils/graphQLFetch';
import mutations from '../utils/mutations';

class NewEndpoint extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      route: '',
      method: 'GET',
      response: {
        statusCode: 200,
        body: '',
        redirect: '',
        headers: [],
      },
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
    const { response } = this.state;
    switch (type) {
      case 'statusCode': {
        if (evt && evt.target) {
          if (evt.target.value === '') {
            this.setState({
              response: {
                ...response,
                statusCode: 0,
              },
            });
          } else {
            const parsed = parseInt(evt.target.value, 10);
            if (!Number.isNaN(parsed)) {
              this.setState({
                response: {
                  ...response,
                  statusCode: parsed,
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
            response: {
              ...response,
              headers: evt,
            },
          });
        }
        break;
      }
      case 'body':
      case 'redirect': {
        if (evt && evt.target) {
          this.setState({
            response: {
              ...response,
              [type]: evt.target.value,
            },
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
    const {
      response: { statusCode },
    } = this.state;
    const { history } = this.props;
    if (statusCode === 0) {
      // eslint-disable-next-line
      alert('Please specify a valid response status!');
      return;
    }

    const data = {
      ...this.state,
    };

    graphqlFetch({
      query: mutations.endpoints.create,
      variables: { data },
    })
      .then(() => {
        history.push('/__dashboard/endpoints');
      })
      // TODO: Handle this error
      .catch(err => console.log(err));
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
