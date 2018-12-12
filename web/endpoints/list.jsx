import React from 'react';
import { Link } from 'react-router-dom';

import FeatherIcon from '../common/icon';
import '../sass/dashboard.scss';
import graphqlFetch from '../utils/graphQLFetch';
import queries from '../utils/queries';
import mutations from '../utils/mutations';

class EndpointList extends React.Component {
  constructor(props) {
    super(props);

    this._endpointListPoll = null;

    this.state = {
      endpoints: [],
    };
  }

  componentDidMount() {
    if (!this._endpointListPoll) {
      // Start polling every 30 seconds to get new data intermittently
      // (If more endpoints get added in another window)
      this._endpointListPoll = setInterval(() => {
        // Fetch Interval, then set state
        this.fetchEndpoints();
      }, 30000);
    }

    // TODO: Cancel these fetch calls if they are inprogress during unmount
    this.fetchEndpoints();
  }

  componentWillUnmount() {
    if (this._endpointListPoll) {
      clearInterval(this._endpointListPoll);
      this._endpointListPoll = null;
    }
  }

  fetchEndpoints() {
    graphqlFetch({
      query: queries.endpoints.list,
    })
      .then(json => {
        this.setState({
          endpoints: json.data.endpoints,
        });
      })
      .catch(err => {
        // TODO: Handle this error
        console.log(`Received error response: ${JSON.stringify(err.json, null, 2)}`);
      });
  }

  generateDeleteHandler(id) {
    return () => {
      const prompt = `Do you really want to delete ${id ? 'this endpoint' : 'all endpoints'}?`;
      // eslint-disable-next-line
      if (window.confirm(prompt)) {
        if (id) {
          graphqlFetch({
            query: mutations.endpoints.delete,
            variables: { id },
          })
            .then(() => {
              this.fetchEndpoints();
            })
            // TODO: Handle this error
            .catch(err => console.log(err));
        } else {
          graphqlFetch({
            query: mutations.endpoints.deleteAll,
          })
            .then(() => {
              this.fetchEndpoints();
            })
            // TODO: Handle this error
            .catch(err => console.log(err));
        }
      }
    };
  }

  renderEndpointTableRow(endpoint) {
    const {
      id,
      method,
      route,
      response: { statusCode, body, redirect },
    } = endpoint;
    return (
      <tr key={id}>
        <th scope="row">
          <Link to={`/__dashboard/endpoints/${id}`}>{id}</Link>
        </th>
        <td>{method}</td>
        <td>{route}</td>
        <td>{statusCode}</td>
        <td>{body}</td>
        <td>{redirect || 'N/A'}</td>
        <td className="text-center">
          <button
            type="button"
            className="btn btn-sm btn-block btn-danger"
            onClick={this.generateDeleteHandler(id)}
          >
            <FeatherIcon icon="trash" />
          </button>
        </td>
      </tr>
    );
  }

  renderEndpointTable(endpoints) {
    return (
      <div className="col">
        <div className="row no-gutters">
          <table className="endpoints__table table table-bordered table-hover text-center">
            <thead className="thead-light">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Method</th>
                <th scope="col">Route</th>
                <th scope="col">Status</th>
                <th scope="col">Body</th>
                <th scope="col">Redirect Route</th>
                <th scope="col">Delete</th>
              </tr>
            </thead>
            <tbody>{endpoints.map(this.renderEndpointTableRow, this)}</tbody>
          </table>
        </div>
        <div className="row no-gutters">
          <button type="button" className="btn btn-danger" onClick={this.generateDeleteHandler()}>
            Delete All
          </button>
        </div>
      </div>
    );
  }

  static renderEmptyEndpoints() {
    return (
      <div className="col">
        <h3>No Endpoints Found!</h3>
        Select the &quot;New&quot; button to create mock endpoints.
      </div>
    );
  }

  render() {
    const { endpoints } = this.state;
    if (endpoints.length === 0) {
      return EndpointList.renderEmptyEndpoints();
    }
    return this.renderEndpointTable(endpoints);
  }
}

export default EndpointList;
